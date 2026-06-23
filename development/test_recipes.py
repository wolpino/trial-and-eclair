from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Ingredient

from .models import DevelopmentRecipe, RecipeStep, RecipeVersion, VersionIngredientLine

User = get_user_model()


class RecipeAPITests(TestCase):
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
        self.home_cook = User.objects.create_user(
            username="cook",
            password="strong-pass-1",
            role="home_cook",
        )
        self.flour = Ingredient.objects.create(name="All-purpose flour")

    def _create_recipe(self, user=None, *, title: str = "Corn muffin") -> DevelopmentRecipe:
        user = user or self.developer
        self.client.force_login(user)
        response = self.client.post(self.recipes_url, {"title": title}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return DevelopmentRecipe.objects.get(id=response.data["id"])

    def test_home_cook_cannot_access_recipes(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.get(self.recipes_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_recipe_starts_with_version_one(self) -> None:
        self.client.force_login(self.developer)

        response = self.client.post(
            self.recipes_url,
            {"title": "Corn muffin"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Corn muffin")
        self.assertEqual(response.data["current_version"]["version_number"], 1)
        self.assertEqual(response.data["current_version"]["title"], "Corn muffin")

    def test_developer_lists_only_own_recipes(self) -> None:
        self._create_recipe(title="Mine")
        self._create_recipe(self.other_developer, title="Theirs")
        self.client.force_login(self.developer)

        response = self.client.get(self.recipes_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Mine")

    def test_patch_current_version(self) -> None:
        recipe = self._create_recipe()
        version = recipe.current_version
        self.client.force_login(self.developer)

        response = self.client.patch(
            f"{self.recipes_url}{recipe.id}/versions/{version.id}/",
            {"description": "Light and crisp"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        version.refresh_from_db()
        self.assertEqual(version.description, "Light and crisp")

    def test_cannot_patch_non_current_version(self) -> None:
        recipe = self._create_recipe()
        version = recipe.current_version
        self.client.force_login(self.developer)
        self.client.post(
            f"{self.recipes_url}{recipe.id}/save-new-version/",
            {},
            format="json",
        )
        recipe.refresh_from_db()

        response = self.client.patch(
            f"{self.recipes_url}{recipe.id}/versions/{version.id}/",
            {"description": "Stale edit"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_save_new_version_copies_ingredient_lines(self) -> None:
        recipe = self._create_recipe()
        version = recipe.current_version
        VersionIngredientLine.objects.create(
            version=version,
            ingredient=self.flour,
            quantity=Decimal("2.000"),
            unit="cup",
            sort_order=1,
        )
        self.client.force_login(self.developer)

        response = self.client.post(
            f"{self.recipes_url}{recipe.id}/save-new-version/",
            {"version_notes": "Adjusted hydration"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["version_number"], 2)
        self.assertEqual(response.data["version_notes"], "Adjusted hydration")
        self.assertEqual(len(response.data["ingredient_lines"]), 1)
        self.assertEqual(
            response.data["ingredient_lines"][0]["quantity"],
            "2.000",
        )

        recipe.refresh_from_db()
        self.assertEqual(recipe.current_version.version_number, 2)
        self.assertEqual(version.ingredient_lines.count(), 1)

    def test_ingredient_line_crud_on_current_version(self) -> None:
        recipe = self._create_recipe()
        version = recipe.current_version
        lines_url = f"/api/v1/versions/{version.id}/ingredient-lines/"
        self.client.force_login(self.developer)

        create_response = self.client.post(
            lines_url,
            {
                "ingredient": str(self.flour.id),
                "quantity": "1.500",
                "unit": "cup",
                "sort_order": 1,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        line_id = create_response.data["id"]

        patch_response = self.client.patch(
            f"{lines_url}{line_id}/",
            {"prep_note": "sifted"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data["prep_note"], "sifted")

        delete_response = self.client.delete(f"{lines_url}{line_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(VersionIngredientLine.objects.filter(id=line_id).count(), 0)

    def test_cannot_edit_ingredient_lines_on_old_version(self) -> None:
        recipe = self._create_recipe()
        old_version = recipe.current_version
        VersionIngredientLine.objects.create(
            version=old_version,
            ingredient=self.flour,
            quantity=Decimal("1.000"),
            unit="cup",
        )
        self.client.force_login(self.developer)
        self.client.post(
            f"{self.recipes_url}{recipe.id}/save-new-version/",
            {},
            format="json",
        )
        lines_url = f"/api/v1/versions/{old_version.id}/ingredient-lines/"

        response = self.client.post(
            lines_url,
            {
                "ingredient": str(self.flour.id),
                "quantity": "2.000",
                "unit": "cup",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_step_crud_on_current_version(self) -> None:
        recipe = self._create_recipe()
        version = recipe.current_version
        steps_url = f"/api/v1/versions/{version.id}/steps/"
        self.client.force_login(self.developer)

        create_response = self.client.post(
            steps_url,
            {"order": 1, "body": "Mix dry ingredients."},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        step_id = create_response.data["id"]

        patch_response = self.client.patch(
            f"{steps_url}{step_id}/",
            {"body": "Mix and sift dry ingredients."},
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data["body"], "Mix and sift dry ingredients.")

        delete_response = self.client.delete(f"{steps_url}{step_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_save_new_version_copies_steps(self) -> None:
        recipe = self._create_recipe()
        version = recipe.current_version
        RecipeStep.objects.create(version=version, order=1, body="Bake at 350°F.")
        self.client.force_login(self.developer)

        response = self.client.post(
            f"{self.recipes_url}{recipe.id}/save-new-version/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["steps"]), 1)
        self.assertEqual(response.data["steps"][0]["body"], "Bake at 350°F.")

    def test_cannot_edit_steps_on_old_version(self) -> None:
        recipe = self._create_recipe()
        old_version = recipe.current_version
        RecipeStep.objects.create(version=old_version, order=1, body="Old step.")
        self.client.force_login(self.developer)
        self.client.post(
            f"{self.recipes_url}{recipe.id}/save-new-version/",
            {},
            format="json",
        )
        steps_url = f"/api/v1/versions/{old_version.id}/steps/"

        response = self.client.post(
            steps_url,
            {"order": 2, "body": "New step on old version."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
