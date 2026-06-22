from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from development import services as dev_services
from development.models import Idea

from .models import Reference, ReferenceType

User = get_user_model()


class ReferenceAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.references_url = "/api/v1/references/"
        self.home_cook = User.objects.create_user(
            username="cook",
            password="strong-pass-1",
            role="home_cook",
        )
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.other_user = User.objects.create_user(
            username="other",
            password="strong-pass-1",
            role="home_cook",
        )

    def test_unauthenticated_user_cannot_access_references(self) -> None:
        response = self.client.get(self.references_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_home_cook_creates_reference(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.post(
            self.references_url,
            {
                "ref_type": ReferenceType.COOKBOOK,
                "title": "Flour Water Salt Yeast",
                "url": "https://example.com/fwsy",
                "notes": "Own the hardcover",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Flour Water Salt Yeast")

    def test_list_filters_by_ref_type(self) -> None:
        Reference.objects.create(
            user=self.home_cook,
            ref_type=ReferenceType.BLOG,
            title="Kitchn",
        )
        Reference.objects.create(
            user=self.home_cook,
            ref_type=ReferenceType.COOKBOOK,
            title="On Food and Cooking",
        )
        self.client.force_login(self.home_cook)

        response = self.client.get(self.references_url, {"ref_type": ReferenceType.BLOG})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Kitchn")

    def test_developer_links_reference_to_idea(self) -> None:
        self.client.force_login(self.developer)
        idea_response = self.client.post(
            "/api/v1/ideas/",
            {"title": "Sourdough experiment"},
            format="json",
        )
        reference_response = self.client.post(
            self.references_url,
            {
                "ref_type": ReferenceType.ARTICLE,
                "title": "Starter science",
            },
            format="json",
        )

        link_response = self.client.post(
            f"{self.references_url}{reference_response.data['id']}/links/",
            {
                "idea": idea_response.data["id"],
                "note": "Hydration ratios",
            },
            format="json",
        )

        self.assertEqual(link_response.status_code, status.HTTP_201_CREATED)

    def test_developer_links_reference_to_recipe_version(self) -> None:
        recipe = dev_services.create_development_recipe(self.developer, title="House loaf")
        reference = Reference.objects.create(
            user=self.developer,
            ref_type=ReferenceType.CHEF,
            title="Tartine",
        )
        self.client.force_login(self.developer)

        response = self.client.post(
            f"{self.references_url}{reference.id}/links/",
            {
                "recipe_version": str(recipe.current_version_id),
                "note": "Levain approach",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_cannot_access_other_users_reference(self) -> None:
        reference = Reference.objects.create(
            user=self.other_user,
            ref_type=ReferenceType.TOOL,
            title="Scale",
        )
        self.client.force_login(self.home_cook)

        response = self.client.get(f"{self.references_url}{reference.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_link_rejects_foreign_idea(self) -> None:
        other_developer = User.objects.create_user(
            username="other-dev",
            password="strong-pass-1",
            role="developer",
        )
        foreign_idea = Idea.objects.create(user=other_developer, title="Other")
        reference = Reference.objects.create(
            user=self.developer,
            ref_type=ReferenceType.BLOG,
            title="Mine",
        )
        self.client.force_login(self.developer)

        response = self.client.post(
            f"{self.references_url}{reference.id}/links/",
            {"idea": str(foreign_idea.id)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
