from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
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
