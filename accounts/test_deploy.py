from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from config.exceptions import GENERIC_ERROR_MESSAGE

from .models import UserRole

User = get_user_model()
SENTINEL = "SENTINEL-internal-detail"


class DeploySurfaceTests(TestCase):
    def test_healthz_is_public(self) -> None:
        response = self.client.get("/healthz")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_admin_is_not_the_spa(self) -> None:
        response = self.client.get("/admin")

        self.assertEqual(response.status_code, status.HTTP_301_MOVED_PERMANENTLY)
        self.assertEqual(response.headers["Location"], "/admin/")

    def test_unknown_api_path_is_not_spa(self) -> None:
        response = self.client.get("/api/v1/does-not-exist/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertNotEqual(response.headers.get("Content-Type", ""), "text/html")


class ErrorBodyTests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.user = User.objects.create_user(
            username="cook",
            password="strong-pass-1",
            role=UserRole.HOME_COOK,
        )
        self.client.force_login(self.user)

    @patch("accounts.views.start_developer_trial", side_effect=RuntimeError(SENTINEL))
    def test_unhandled_exception_returns_generic_json_500(self, _mock) -> None:
        with self.assertLogs("config.exceptions", level="ERROR"):
            response = self.client.post("/api/v1/auth/start-trial/")

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(
            response.json(),
            {"detail": GENERIC_ERROR_MESSAGE, "code": "server_error"},
        )
        self.assertNotIn(SENTINEL, response.content.decode())
        self.assertNotIn("Traceback", response.content.decode())

    def test_trial_unavailable_returns_fixed_message(self) -> None:
        self.user.trial_ends_at = timezone.now()
        self.user.save(update_fields=["trial_ends_at"])

        response = self.client.post("/api/v1/auth/start-trial/")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json(),
            {
                "detail": "Your trial has ended. Paid billing is not available yet.",
                "code": "invalid",
            },
        )

    def test_malformed_json_hides_parser_text(self) -> None:
        response = self.client.patch(
            "/api/v1/auth/me/",
            data="{not json",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json(),
            {"detail": "The request body could not be read.", "code": "parse_error"},
        )
