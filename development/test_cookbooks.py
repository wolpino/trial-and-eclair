from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from . import services
from .models import Cookbook, CookbookRecipe

User = get_user_model()


class CookbookAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.cookbooks_url = "/api/v1/cookbooks/"
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.home_cook = User.objects.create_user(
            username="cook",
            password="strong-pass-1",
            role="home_cook",
        )
        self.recipe = services.create_development_recipe(self.developer, title="Corn muffin")
        services.publish_recipe(self.recipe, slug="corn-muffin")

    def test_home_cook_cannot_access_cookbooks(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.get(self.cookbooks_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_developer_creates_cookbook_and_adds_recipe_entry(self) -> None:
        self.client.force_login(self.developer)

        create_response = self.client.post(
            self.cookbooks_url,
            {"title": "Weekend bakes", "description": "Favorites"},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        cookbook_id = create_response.data["id"]

        entry_response = self.client.post(
            f"{self.cookbooks_url}{cookbook_id}/entries/",
            {"recipe": str(self.recipe.id)},
            format="json",
        )
        self.assertEqual(entry_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            entry_response.data["snapshot_version"]["title"],
            "Corn muffin",
        )

    def test_publish_cookbook_and_view_publicly(self) -> None:
        cookbook = Cookbook.objects.create(
            user=self.developer,
            title="Weekend bakes",
            description="Favorites",
        )
        services.add_cookbook_entry(cookbook, self.recipe)
        self.client.force_login(self.developer)

        publish_response = self.client.post(
            f"{self.cookbooks_url}{cookbook.id}/publish/",
            {"slug": "weekend-bakes"},
            format="json",
        )
        self.assertEqual(publish_response.status_code, status.HTTP_200_OK)
        self.assertEqual(publish_response.data["status"], "published")

        public_response = self.client.get("/api/v1/public/cookbooks/weekend-bakes/")
        self.assertEqual(public_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(public_response.data["recipes"]), 1)
        self.assertEqual(public_response.data["recipes"][0]["recipe_slug"], "corn-muffin")

    def test_unpublished_recipe_stays_in_public_cookbook_without_link(self) -> None:
        cookbook = Cookbook.objects.create(user=self.developer, title="Weekend bakes")
        services.add_cookbook_entry(cookbook, self.recipe)
        services.publish_cookbook(cookbook, slug="weekend-bakes")
        services.unpublish_recipe(self.recipe)

        public_response = self.client.get("/api/v1/public/cookbooks/weekend-bakes/")

        self.assertEqual(public_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(public_response.data["recipes"]), 1)
        self.assertEqual(public_response.data["recipes"][0]["title"], "Corn muffin")
        self.assertIsNone(public_response.data["recipes"][0]["recipe_slug"])

    def test_unpublish_cookbook_hides_public_page(self) -> None:
        cookbook = Cookbook.objects.create(user=self.developer, title="Weekend bakes")
        services.publish_cookbook(cookbook, slug="weekend-bakes")
        self.client.force_login(self.developer)

        self.client.post(f"{self.cookbooks_url}{cookbook.id}/unpublish/", {}, format="json")

        public_response = self.client.get("/api/v1/public/cookbooks/weekend-bakes/")
        self.assertEqual(public_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_entry_snapshot_does_not_change_when_new_version_saved(self) -> None:
        cookbook = Cookbook.objects.create(user=self.developer, title="Weekend bakes")
        entry = services.add_cookbook_entry(cookbook, self.recipe)
        frozen_version_id = entry.snapshot_version_id
        frozen_title = entry.snapshot_version.title

        services.save_new_version(self.recipe)
        self.recipe.refresh_from_db()
        self.recipe.current_version.title = "Renamed on v2"
        self.recipe.current_version.save(update_fields=["title", "updated_at"])

        entry.refresh_from_db()
        self.assertEqual(entry.snapshot_version_id, frozen_version_id)
        self.assertEqual(entry.snapshot_version.title, frozen_title)

        services.publish_cookbook(cookbook, slug="weekend-bakes")
        public_response = self.client.get("/api/v1/public/cookbooks/weekend-bakes/")
        self.assertEqual(public_response.data["recipes"][0]["title"], frozen_title)
