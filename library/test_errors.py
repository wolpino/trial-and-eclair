import socket
from unittest.mock import patch
from urllib.error import HTTPError, URLError

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from collection import services as box_services
from config.exceptions import GENERIC_ERROR_MESSAGE

User = get_user_model()
SENTINEL = "SENTINEL-upstream-detail"
URL_IMPORT = "/api/v1/imports/url/"


class UrlImportErrorBodyTests(TestCase):
    def setUp(self) -> None:
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=False)
        self.client.force_login(User.objects.create_user(username="cook", password="strong-pass-1"))

    def _import(self):
        return self.client.post(URL_IMPORT, {"url": "https://example.com/pie"}, format="json")

    def _assert_body(self, response, status_code: int, body: dict) -> None:
        self.assertEqual(response.status_code, status_code)
        self.assertEqual(response.json(), body)
        self.assertNotIn(SENTINEL, response.content.decode())

    @patch("library.services._assert_host_public")
    @patch("library.services._urlopen", side_effect=URLError(SENTINEL))
    def test_fetch_failure_hides_upstream_text(self, _urlopen, _host) -> None:
        self._assert_body(
            self._import(),
            status.HTTP_502_BAD_GATEWAY,
            {"detail": "Could not fetch URL.", "code": "fetch_failed"},
        )

    @patch("library.services._assert_host_public")
    @patch(
        "library.services._urlopen",
        side_effect=HTTPError("https://example.com/pie", 500, SENTINEL, None, None),
    )
    def test_upstream_http_error_hides_upstream_text(self, _urlopen, _host) -> None:
        self._assert_body(
            self._import(),
            status.HTTP_502_BAD_GATEWAY,
            {"detail": "Fetch failed with HTTP 500.", "code": "fetch_failed"},
        )

    @patch("library.services.socket.getaddrinfo", side_effect=socket.gaierror(SENTINEL))
    def test_unresolvable_host_hides_resolver_text(self, _getaddrinfo) -> None:
        self._assert_body(
            self._import(),
            status.HTTP_403_FORBIDDEN,
            {"detail": "Could not resolve host.", "code": "permission_denied"},
        )

    @patch("library.services._assert_host_public")
    @patch("library.services.robots_allows", return_value=False)
    def test_robots_disallowed_returns_fixed_message(self, _robots, _host) -> None:
        self._assert_body(
            self._import(),
            status.HTTP_403_FORBIDDEN,
            {"detail": "This URL is disallowed by robots.txt.", "code": "permission_denied"},
        )

    @patch("library.views.services.import_from_url", side_effect=RuntimeError(SENTINEL))
    def test_parser_crash_returns_generic_500(self, _import) -> None:
        with self.assertLogs("config.exceptions", level="ERROR"):
            response = self._import()

        self._assert_body(
            response,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            {"detail": GENERIC_ERROR_MESSAGE, "code": "server_error"},
        )


class GuestLimitErrorBodyTests(TestCase):
    def test_guest_card_limit_body_has_detail_and_code(self) -> None:
        client = APIClient(enforce_csrf_checks=False)
        guest = User.objects.create_user(username="guest-x", is_guest=True)
        for i in range(box_services.GUEST_CARD_LIMIT):
            box_services.create_box_recipe(guest, title=f"Card {i}")
        client.force_login(guest)
        upload = SimpleUploadedFile("card.txt", b"Cookies\n2 cups flour", content_type="text/plain")

        response = client.post("/api/v1/imports/scan/", {"file": upload}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            response.json(),
            {
                "detail": "Guests can keep up to 5 cards. Sign up to save more.",
                "code": "guest_card_limit",
            },
        )
