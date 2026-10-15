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

    def test_empty_box_lists_no_cards(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.get(self.box_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

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

    def test_home_cook_manages_steps(self) -> None:
        recipe = services.create_box_recipe(self.home_cook, title="Corn muffin")
        steps_url = f"{self.box_url}{recipe.id}/steps/"
        self.client.force_login(self.home_cook)

        create_response = self.client.post(
            steps_url,
            {"order": 1, "body": "Preheat oven."},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        detail_response = self.client.get(f"{self.box_url}{recipe.id}/")
        self.assertEqual(len(detail_response.data["steps"]), 1)
        self.assertEqual(detail_response.data["steps"][0]["body"], "Preheat oven.")


class GuestCardLimitTests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.box_url = "/api/v1/recipe-box/"
        self.guest = User.objects.create_user(username="guest-x", is_guest=True)
        self.client.force_login(self.guest)

    def _fill(self, count: int = services.GUEST_CARD_LIMIT):
        return [
            services.create_box_recipe(self.guest, title=f"Card {i}")
            for i in range(count)
        ]

    def test_guest_can_add_up_to_limit_then_gets_403_with_code(self) -> None:
        self._fill(services.GUEST_CARD_LIMIT - 1)

        ok = self.client.post(self.box_url, {"title": "Last"}, format="json")
        blocked = self.client.post(self.box_url, {"title": "Sixth"}, format="json")

        self.assertEqual(ok.status_code, status.HTTP_201_CREATED)
        self.assertEqual(blocked.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(blocked.data["code"], "guest_card_limit")
        self.assertEqual(self.guest.recipe_box_items.count(), 5)

    def test_deleting_a_card_allows_one_more(self) -> None:
        cards = self._fill()

        self.client.delete(f"{self.box_url}{cards[0].id}/")
        again = self.client.post(self.box_url, {"title": "New"}, format="json")
        blocked = self.client.post(self.box_url, {"title": "Extra"}, format="json")

        self.assertEqual(again.status_code, status.HTTP_201_CREATED)
        self.assertEqual(blocked.status_code, status.HTTP_403_FORBIDDEN)

    def test_guest_at_limit_can_patch_and_delete_own_cards(self) -> None:
        cards = self._fill()

        patch = self.client.patch(
            f"{self.box_url}{cards[0].id}/", {"title": "Renamed"}, format="json"
        )
        delete = self.client.delete(f"{self.box_url}{cards[1].id}/")

        self.assertEqual(patch.status_code, status.HTTP_200_OK)
        self.assertEqual(delete.status_code, status.HTTP_204_NO_CONTENT)

    def test_signed_up_user_has_no_limit(self) -> None:
        cook = User.objects.create_user(username="cook", password="strong-pass-1")
        for i in range(services.GUEST_CARD_LIMIT + 2):
            services.create_box_recipe(cook, title=f"Card {i}")

        self.assertEqual(cook.recipe_box_items.count(), services.GUEST_CARD_LIMIT + 2)
