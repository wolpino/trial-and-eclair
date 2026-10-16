import json
import os
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Ingredient

from .management.commands.load_starter_recipes import STARTER_FILE
from .models import CollectionRecipe, HiddenStarterRecipe, RecipeBoxItem, StarterRecipe
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

    def test_card_saves_and_returns_servings(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.post(
            self.box_url, {"title": "Corn muffin", "servings": 12}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["servings"], 12)
        detail = self.client.get(f"{self.box_url}{response.data['id']}/")
        self.assertEqual(detail.data["servings"], 12)

    def test_line_with_only_raw_text_saves(self) -> None:
        recipe = services.create_box_recipe(self.home_cook, title="Corn muffin")
        self.client.force_login(self.home_cook)

        response = self.client.post(
            f"{self.box_url}{recipe.id}/ingredient-lines/",
            {"raw_text": "salt to taste"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["raw_text"], "salt to taste")
        self.assertIsNone(response.data["ingredient"])
        self.assertIsNone(response.data["ingredient_name"])
        self.assertIsNone(response.data["quantity"])

    def test_line_needs_raw_text_or_ingredient(self) -> None:
        recipe = services.create_box_recipe(self.home_cook, title="Corn muffin")
        self.client.force_login(self.home_cook)

        response = self.client.post(
            f"{self.box_url}{recipe.id}/ingredient-lines/",
            {"unit": "cup"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manual_card_defaults_to_typed_and_patch_changes_source_type(self) -> None:
        self.client.force_login(self.home_cook)
        created = self.client.post(self.box_url, {"title": "Corn muffin"}, format="json")
        self.assertEqual(created.data["source_type"], "typed")

        for value in ("handwritten", "recipe_card", "cookbook", "web", "scan", "typed"):
            response = self.client.patch(
                f"{self.box_url}{created.data['id']}/",
                {"source_type": value},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data["source_type"], value)

        bad = self.client.patch(
            f"{self.box_url}{created.data['id']}/",
            {"source_type": "carrier_pigeon"},
            format="json",
        )
        self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)

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


class StarterRecipeTests(TestCase):
    url = "/api/v1/starter-recipes/"

    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.starter = StarterRecipe.objects.create(
            title="Placeholder pancakes",
            servings=4,
            prep_minutes=10,
            cook_minutes=15,
            ingredient_lines=["1 cup flour", "1 egg"],
            steps=["Mix.", "Cook."],
            sort_order=1,
        )
        StarterRecipe.objects.create(title="Retired", is_active=False)
        self.cook = User.objects.create_user(username="cook", password="strong-pass-1")
        self.guest = User.objects.create_user(username="guest-x", is_guest=True)

    def test_list_works_without_session_in_box_card_shape(self) -> None:
        services.create_box_recipe(self.cook, title="Mine")
        self.client.force_login(self.cook)
        box_card = self.client.get("/api/v1/recipe-box/").data[0]
        self.client.logout()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([c["title"] for c in response.data], ["Placeholder pancakes"])
        card = response.data[0]
        self.assertTrue(card["is_starter"])
        self.assertEqual(set(card) - {"is_starter"}, set(box_card))
        self.assertEqual(card["servings"], 4)
        self.assertEqual(
            [line["raw_text"] for line in card["ingredient_lines"]],
            ["1 cup flour", "1 egg"],
        )
        self.assertEqual([step["body"] for step in card["steps"]], ["Mix.", "Cook."])

    def test_starters_cannot_be_edited_or_deleted(self) -> None:
        self.client.force_login(self.cook)
        detail = f"{self.url}{self.starter.id}/"

        patch_response = self.client.patch(detail, {"title": "X"}, format="json")
        delete_response = self.client.delete(detail)

        self.assertIn(patch_response.status_code, (404, 405))
        self.assertIn(delete_response.status_code, (404, 405))
        self.starter.refresh_from_db()
        self.assertEqual(self.starter.title, "Placeholder pancakes")

    def test_fork_copies_starter_into_box_as_normal_card(self) -> None:
        self.client.force_login(self.cook)

        response = self.client.post(f"{self.url}{self.starter.id}/fork/")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("is_starter", response.data)
        recipe = CollectionRecipe.objects.get(id=response.data["id"])
        self.assertEqual(recipe.user, self.cook)
        self.assertTrue(RecipeBoxItem.objects.filter(recipe=recipe).exists())
        self.assertEqual(recipe.servings, 4)
        self.assertEqual(
            [line.raw_text for line in recipe.ingredient_lines.all()],
            ["1 cup flour", "1 egg"],
        )
        self.assertEqual([s.body for s in recipe.steps.order_by("order")], ["Mix.", "Cook."])

    def test_guest_at_limit_cannot_fork(self) -> None:
        for i in range(services.GUEST_CARD_LIMIT):
            services.create_box_recipe(self.guest, title=f"Card {i}")
        self.client.force_login(self.guest)

        response = self.client.post(f"{self.url}{self.starter.id}/fork/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["code"], "guest_card_limit")

    def test_hide_is_per_user_and_signed_up_only(self) -> None:
        self.client.force_login(self.guest)
        guest_hide = self.client.post(f"{self.url}{self.starter.id}/hide/")
        self.assertEqual(guest_hide.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_login(self.cook)
        hide = self.client.post(f"{self.url}{self.starter.id}/hide/")
        self.assertEqual(hide.status_code, status.HTTP_204_NO_CONTENT)
        again = self.client.post(f"{self.url}{self.starter.id}/hide/")
        self.assertEqual(again.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.client.get(self.url).data, [])
        self.assertEqual(HiddenStarterRecipe.objects.count(), 1)

        self.client.force_login(self.guest)
        self.assertEqual(len(self.client.get(self.url).data), 1)
        self.client.logout()
        self.assertEqual(len(self.client.get(self.url).data), 1)


class LoadStarterRecipesTests(TestCase):
    def test_idempotent_creates_no_users_and_runs_on_public_host(self) -> None:
        users_before = User.objects.count()
        with patch.dict(os.environ, {"RENDER_EXTERNAL_HOSTNAME": "app.onrender.com"}):
            call_command("load_starter_recipes")
            first = list(StarterRecipe.objects.order_by("sort_order").values_list("id", "title"))
            call_command("load_starter_recipes")

        expected = len(json.loads(STARTER_FILE.read_text()))
        self.assertEqual(len(first), expected)
        self.assertEqual(
            list(StarterRecipe.objects.order_by("sort_order").values_list("id", "title")),
            first,
        )
        self.assertEqual(StarterRecipe.objects.filter(is_active=True).count(), expected)
        self.assertEqual(User.objects.count(), users_before)
