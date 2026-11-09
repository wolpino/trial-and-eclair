from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db.models import ProtectedError
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from config.exceptions import GENERIC_ERROR_MESSAGE

from . import services
from .models import Cookbook, Idea

User = get_user_model()
SENTINEL = "SENTINEL-internal-detail"


class DomainErrorBodyTests(TestCase):
    """Domain errors return a fixed message; anything else is a generic 500."""

    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.client.force_login(self.developer)
        self.recipe = services.create_development_recipe(self.developer, title="Corn muffin")
        self.idea = Idea.objects.create(user=self.developer, title="Galette")
        self.cookbook = Cookbook.objects.create(user=self.developer, title="Muffins")

    def _requests(self) -> dict:
        version = str(self.recipe.current_version_id)
        return {
            "promote_idea": lambda: self.client.post(
                f"/api/v1/ideas/{self.idea.id}/promote/", {}, format="json"
            ),
            "publish_recipe": lambda: self.client.post(
                f"/api/v1/recipes/{self.recipe.id}/publish/", {"slug": "corn"}, format="json"
            ),
            "compare_versions": lambda: self.client.get(
                f"/api/v1/recipes/{self.recipe.id}/compare-versions/",
                {"left": version, "right": version},
            ),
            "add_cookbook_entry": lambda: self.client.post(
                f"/api/v1/cookbooks/{self.cookbook.id}/entries/",
                {"recipe": str(self.recipe.id)},
                format="json",
            ),
        }

    def test_domain_error_returns_its_fixed_message(self) -> None:
        for name, send in self._requests().items():
            error = services.RecipeError("Recipe has no current version.")
            with self.subTest(name), patch(f"development.views.services.{name}", side_effect=error):
                response = send()

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertEqual(
                    response.json(),
                    {"detail": "Recipe has no current version.", "code": "invalid"},
                )

    def test_other_errors_do_not_leak_exception_text(self) -> None:
        for name, send in self._requests().items():
            error = ValueError(SENTINEL)
            with (
                self.subTest(name),
                patch(f"development.views.services.{name}", side_effect=error),
                self.assertLogs("config.exceptions", level="ERROR"),
            ):
                response = send()

                self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
                self.assertEqual(response.json()["detail"], GENERIC_ERROR_MESSAGE)
                self.assertNotIn(SENTINEL, response.content.decode())

    def test_promote_twice_returns_fixed_message(self) -> None:
        url = f"/api/v1/ideas/{self.idea.id}/promote/"
        self.client.post(url, {}, format="json")

        response = self.client.post(url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json(),
            {"detail": "Idea already promoted to a recipe.", "code": "invalid"},
        )

    def test_missing_compare_params_use_the_detail_shape(self) -> None:
        response = self.client.get(f"/api/v1/recipes/{self.recipe.id}/compare-versions/")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json(),
            {"detail": "Query params 'left' and 'right' are required.", "code": "invalid"},
        )


@override_settings(DEBUG=False)
class NoGeneric500Tests(TestCase):
    """Requests from audit #137 that used to return a generic 500."""

    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.other = User.objects.create_user(
            username="other",
            password="strong-pass-1",
            role="developer",
        )
        self.client.force_login(self.developer)
        self.recipe = services.create_development_recipe(self.developer, title="Corn muffin")
        self.cookbook = Cookbook.objects.create(user=self.developer, title="Muffins")

    def test_publish_recipe_with_taken_slug_is_a_field_error(self) -> None:
        theirs = services.create_development_recipe(self.other, title="Pie")
        services.publish_recipe(theirs, slug="taken")

        response = self.client.post(
            f"/api/v1/recipes/{self.recipe.id}/publish/", {"slug": "taken"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json(), {"slug": ["That web address is taken. Try another."]})

    def test_republish_recipe_with_own_slug_still_works(self) -> None:
        url = f"/api/v1/recipes/{self.recipe.id}/publish/"
        self.client.post(url, {"slug": "mine"}, format="json")

        response = self.client.post(url, {"slug": "mine"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["slug"], "mine")

    def test_publish_cookbook_with_taken_slug_is_a_field_error(self) -> None:
        theirs = Cookbook.objects.create(user=self.other, title="Pies")
        services.publish_cookbook(theirs, slug="taken")

        response = self.client.post(
            f"/api/v1/cookbooks/{self.cookbook.id}/publish/", {"slug": "taken"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json(), {"slug": ["That web address is taken. Try another."]})

    def test_republish_cookbook_with_own_slug_still_works(self) -> None:
        url = f"/api/v1/cookbooks/{self.cookbook.id}/publish/"
        self.client.post(url, {"slug": "mine"}, format="json")

        response = self.client.post(url, {"slug": "mine"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["slug"], "mine")

    def test_adding_the_same_recipe_twice_is_refused(self) -> None:
        url = f"/api/v1/cookbooks/{self.cookbook.id}/entries/"
        self.client.post(url, {"recipe": str(self.recipe.id)}, format="json")

        response = self.client.post(url, {"recipe": str(self.recipe.id)}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json(),
            {"detail": "This recipe is already in this cookbook.", "code": "invalid"},
        )

    def test_entry_sort_order_is_validated(self) -> None:
        entry = services.add_cookbook_entry(self.cookbook, self.recipe)
        url = f"/api/v1/cookbooks/{self.cookbook.id}/entries/{entry.id}/"
        for value in ("abc", -1, [1]):
            with self.subTest(value=value):
                response = self.client.patch(url, {"sort_order": value}, format="json")

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertEqual(list(response.json()), ["sort_order"])

    def test_entry_sort_order_update_still_works(self) -> None:
        entry = services.add_cookbook_entry(self.cookbook, self.recipe)

        response = self.client.patch(
            f"/api/v1/cookbooks/{self.cookbook.id}/entries/{entry.id}/",
            {"sort_order": 3},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["sort_order"], 3)

    def test_journal_filter_with_bad_recipe_id(self) -> None:
        response = self.client.get("/api/v1/journal/", {"recipe": "nope"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json(), {"detail": "Pick a valid recipe.", "code": "invalid"})

    def test_compare_versions_with_bad_version_id(self) -> None:
        response = self.client.get(
            f"/api/v1/recipes/{self.recipe.id}/compare-versions/",
            {"left": "nope", "right": str(self.recipe.current_version_id)},
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()["code"], "not_found")

    def test_blocked_delete_returns_in_use(self) -> None:
        idea = Idea.objects.create(user=self.developer, title="Galette")
        error = ProtectedError(SENTINEL, set())
        with patch("development.models.Idea.delete", side_effect=error):
            response = self.client.delete(f"/api/v1/ideas/{idea.id}/")

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(
            response.json(),
            {
                "detail": "This is still used somewhere else, so it can't be deleted yet.",
                "code": "in_use",
            },
        )
        self.assertNotIn(SENTINEL, response.content.decode())
