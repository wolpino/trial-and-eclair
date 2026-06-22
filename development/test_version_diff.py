from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Ingredient

from . import services
from .models import DevelopmentRecipe, VersionIngredientLine

User = get_user_model()


class VersionDiffAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.recipes_url = "/api/v1/recipes/"
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.flour = Ingredient.objects.create(name="All-purpose flour")
        self.sugar = Ingredient.objects.create(name="Sugar")

    def _create_recipe(self) -> DevelopmentRecipe:
        self.client.force_login(self.developer)
        response = self.client.post(
            self.recipes_url,
            {"title": "Corn muffin"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return DevelopmentRecipe.objects.get(id=response.data["id"])

    def test_compare_versions_reports_field_and_ingredient_changes(self) -> None:
        recipe = self._create_recipe()
        v1 = recipe.current_version
        v1.description = "Original"
        v1.save(update_fields=["description", "updated_at"])
        VersionIngredientLine.objects.create(
            version=v1,
            ingredient=self.flour,
            quantity=Decimal("2.000"),
            unit="cup",
        )

        services.save_new_version(recipe, version_notes="More sugar")
        recipe.refresh_from_db()
        v2 = recipe.current_version
        v2.description = "Sweeter"
        v2.save(update_fields=["description", "updated_at"])
        VersionIngredientLine.objects.create(
            version=v2,
            ingredient=self.flour,
            quantity=Decimal("2.000"),
            unit="cup",
        )
        VersionIngredientLine.objects.create(
            version=v2,
            ingredient=self.sugar,
            quantity=Decimal("0.500"),
            unit="cup",
        )

        response = self.client.get(
            f"{self.recipes_url}{recipe.id}/compare-versions/",
            {"left": str(v1.id), "right": str(v2.id)},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["left_version"]["version_number"], 1)
        self.assertEqual(response.data["right_version"]["version_number"], 2)
        self.assertEqual(
            response.data["field_changes"][0]["field"],
            "description",
        )
        self.assertEqual(len(response.data["ingredient_changes"]["added"]), 1)
        self.assertEqual(
            response.data["ingredient_changes"]["added"][0]["ingredient_name"],
            "Sugar",
        )
        self.assertEqual(len(response.data["ingredient_changes"]["removed"]), 0)
        self.assertEqual(len(response.data["ingredient_changes"]["changed"]), 0)

    def test_compare_versions_requires_left_and_right(self) -> None:
        recipe = self._create_recipe()

        response = self.client.get(
            f"{self.recipes_url}{recipe.id}/compare-versions/",
            {"left": str(recipe.current_version_id)},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_compare_versions_rejects_other_recipe_versions(self) -> None:
        recipe_a = self._create_recipe()
        recipe_b = self._create_recipe()
        v1 = recipe_a.current_version
        v_other = recipe_b.current_version

        response = self.client.get(
            f"{self.recipes_url}{recipe_a.id}/compare-versions/",
            {"left": str(v1.id), "right": str(v_other.id)},
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
