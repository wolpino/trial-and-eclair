from decimal import Decimal
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Ingredient

from .models import (
    DevelopmentRecipe,
    ForkType,
    RecipeFork,
    RecipeStep,
    VersionIngredientLine,
)
from . import services

User = get_user_model()


class PublishAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.recipes_url = "/api/v1/recipes/"
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.other_developer = User.objects.create_user(
            username="other-dev",
            password="strong-pass-1",
            role="developer",
        )
        self.flour = Ingredient.objects.create(name="All-purpose flour")

    def _create_recipe(self, *, title: str = "Corn muffin") -> DevelopmentRecipe:
        self.client.force_login(self.developer)
        response = self.client.post(self.recipes_url, {"title": title}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return DevelopmentRecipe.objects.get(id=response.data["id"])

    def test_publish_sets_slug_and_public_fields(self) -> None:
        recipe = self._create_recipe()
        version = recipe.current_version
        VersionIngredientLine.objects.create(
            version=version,
            ingredient=self.flour,
            quantity=Decimal("2.000"),
            unit="cup",
        )
        RecipeStep.objects.create(version=version, order=1, body="Mix and bake.")

        response = self.client.post(
            f"{self.recipes_url}{recipe.id}/publish/",
            {"story": "Sunday batch", "slug": "corn-muffin"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], "corn-muffin")
        self.assertEqual(response.data["status"], "published")
        self.assertIsNotNone(response.data["published_at"])
        self.assertEqual(
            str(response.data["published_version"]["id"]),
            str(version.id),
        )

        public_response = self.client.get("/api/v1/public/recipes/corn-muffin/")
        self.assertEqual(public_response.status_code, status.HTTP_200_OK)
        self.assertEqual(public_response.data["title"], "Corn muffin")
        self.assertEqual(public_response.data["story"], "Sunday batch")
        self.assertEqual(len(public_response.data["ingredient_lines"]), 1)
        self.assertEqual(len(public_response.data["steps"]), 1)

    def test_publish_accepts_optional_hero_image(self) -> None:
        recipe = self._create_recipe(title="Easy Bagel")
        buffer = BytesIO()
        Image.new("RGB", (1, 1), color="red").save(buffer, format="JPEG")
        hero_image = SimpleUploadedFile(
            "hero.jpg",
            buffer.getvalue(),
            content_type="image/jpeg",
        )

        response = self.client.post(
            f"{self.recipes_url}{recipe.id}/publish/",
            {
                "story": "First bake",
                "hero_image": hero_image,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["published_version"]["hero_image"])

    def test_unpublish_hides_public_recipe_but_keeps_snapshot(self) -> None:
        recipe = self._create_recipe()
        self.client.post(f"{self.recipes_url}{recipe.id}/publish/", {}, format="json")
        slug = DevelopmentRecipe.objects.get(id=recipe.id).slug

        unpublish_response = self.client.post(
            f"{self.recipes_url}{recipe.id}/unpublish/",
            {},
            format="json",
        )
        self.assertEqual(unpublish_response.status_code, status.HTTP_200_OK)
        self.assertEqual(unpublish_response.data["status"], "unpublished")
        self.assertIsNotNone(unpublish_response.data["published_version"])

        public_response = self.client.get(f"/api/v1/public/recipes/{slug}/")
        self.assertEqual(public_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_recipe_includes_fork_lineage_when_enabled(self) -> None:
        source = self._create_recipe(title="Original loaf")
        self.client.post(f"{self.recipes_url}{source.id}/publish/", {}, format="json")
        source.refresh_from_db()

        fork_recipe = services.create_development_recipe(
            self.developer,
            title="My rework",
        )
        fork_recipe.fork_record = RecipeFork.objects.create(
            user=self.developer,
            forked_from_version=source.published_version,
            forked_from_user=self.other_developer,
            fork_type=ForkType.REWORK,
        )
        fork_recipe.save(update_fields=["fork_record", "updated_at"])
        self.client.post(
            f"{self.recipes_url}{fork_recipe.id}/publish/",
            {"slug": "my-rework"},
            format="json",
        )

        public_response = self.client.get("/api/v1/public/recipes/my-rework/")
        self.assertEqual(public_response.status_code, status.HTTP_200_OK)
        self.assertEqual(public_response.data["fork_lineage"]["title"], "Original loaf")
        self.assertEqual(
            public_response.data["fork_lineage"]["author"],
            self.other_developer.username,
        )
        self.assertEqual(public_response.data["fork_lineage"]["slug"], source.slug)

    def test_public_recipe_hides_fork_lineage_when_author_opted_out(self) -> None:
        self.developer.show_forks = False
        self.developer.save(update_fields=["show_forks"])

        source = self._create_recipe(title="Original loaf")
        self.client.post(f"{self.recipes_url}{source.id}/publish/", {}, format="json")
        source.refresh_from_db()

        fork_recipe = services.create_development_recipe(
            self.developer,
            title="My rework",
        )
        fork_recipe.fork_record = RecipeFork.objects.create(
            user=self.developer,
            forked_from_version=source.published_version,
            forked_from_user=self.other_developer,
            fork_type=ForkType.REWORK,
        )
        fork_recipe.save(update_fields=["fork_record", "updated_at"])
        self.client.post(
            f"{self.recipes_url}{fork_recipe.id}/publish/",
            {"slug": "hidden-lineage"},
            format="json",
        )

        public_response = self.client.get("/api/v1/public/recipes/hidden-lineage/")
        self.assertIsNone(public_response.data["fork_lineage"])

    def test_publish_specific_version(self) -> None:
        recipe = self._create_recipe()
        first_version = recipe.current_version
        first_version.description = "Version one"
        first_version.save(update_fields=["description", "updated_at"])

        services.save_new_version(recipe)
        recipe.refresh_from_db()
        second_version = recipe.current_version
        second_version.description = "Version two"
        second_version.save(update_fields=["description", "updated_at"])

        response = self.client.post(
            f"{self.recipes_url}{recipe.id}/publish/",
            {"version_id": str(first_version.id)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            str(response.data["published_version"]["id"]),
            str(first_version.id),
        )
        self.assertEqual(
            response.data["published_version"]["description"],
            "Version one",
        )
