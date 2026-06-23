from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Idea

User = get_user_model()


class PromoteIdeaAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.client.force_login(self.developer)
        self.idea = Idea.objects.create(
            user=self.developer,
            title="Savory galette",
            notes="Try rye crust",
        )

    def test_promote_creates_recipe_and_links_idea(self) -> None:
        response = self.client.post(
            f"/api/v1/ideas/{self.idea.id}/promote/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data["promoted_recipe"])
        self.idea.refresh_from_db()
        self.assertIsNotNone(self.idea.promoted_recipe_id)
        self.assertEqual(self.idea.promoted_recipe.title, "Savory galette")

    def test_cannot_promote_twice(self) -> None:
        self.client.post(f"/api/v1/ideas/{self.idea.id}/promote/", {}, format="json")

        response = self.client.post(
            f"/api/v1/ideas/{self.idea.id}/promote/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_promote_accepts_custom_title(self) -> None:
        response = self.client.post(
            f"/api/v1/ideas/{self.idea.id}/promote/",
            {"title": "Rye galette v1"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.idea.refresh_from_db()
        self.assertEqual(self.idea.promoted_recipe.title, "Rye galette v1")
