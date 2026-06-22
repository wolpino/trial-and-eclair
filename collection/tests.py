from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Ingredient

from .models import CollectionRecipe, RecipeBoxItem
from . import services

User = get_user_model()


class RecipeBoxAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.box_url = "/api/v1/recipe-box/"
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
        self.other_cook = User.objects.create_user(
            username="other-cook",
            password="strong-pass-1",
            role="home_cook",
        )
        self.flour = Ingredient.objects.create(name="All-purpose flour")

    def test_unauthenticated_user_cannot_access_recipe_box(self) -> None:
        response = self.client.get(self.box_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_home_cook_creates_recipe_in_alphabetical_box(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.post(
            self.box_url,
            {"title": "Corn muffin", "description": "Weekend treat"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            RecipeBoxItem.objects.filter(user=self.home_cook, recipe__title="Corn muffin").exists()
        )

    def test_list_returns_recipes_sorted_by_title(self) -> None:
        services.create_box_recipe(self.home_cook, title="Zucchini bread")
        services.create_box_recipe(self.home_cook, title="Apple pie")
        self.client.force_login(self.home_cook)

        response = self.client.get(self.box_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["title"], "Apple pie")
        self.assertEqual(response.data[1]["title"], "Zucchini bread")

    def test_developer_can_also_use_recipe_box(self) -> None:
        self.client.force_login(self.developer)

        response = self.client.post(self.box_url, {"title": "House loaf"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_home_cook_manages_ingredient_lines(self) -> None:
        recipe = services.create_box_recipe(self.home_cook, title="Corn muffin")
        lines_url = f"{self.box_url}{recipe.id}/ingredient-lines/"
        self.client.force_login(self.home_cook)

        create_response = self.client.post(
            lines_url,
            {
                "ingredient": str(self.flour.id),
                "quantity": "1.500",
                "unit": "cup",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        list_response = self.client.get(f"{self.box_url}{recipe.id}/")
        self.assertEqual(len(list_response.data["ingredient_lines"]), 1)

    def test_user_cannot_access_other_users_recipe(self) -> None:
        recipe = services.create_box_recipe(self.other_cook, title="Secret stew")
        self.client.force_login(self.home_cook)

        response = self.client.get(f"{self.box_url}{recipe.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_deletes_own_recipe(self) -> None:
        recipe = services.create_box_recipe(self.home_cook, title="Corn muffin")
        self.client.force_login(self.home_cook)

        response = self.client.delete(f"{self.box_url}{recipe.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CollectionRecipe.objects.filter(id=recipe.id).exists())
