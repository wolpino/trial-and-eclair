import http.client
import socket
import tempfile
from unittest.mock import patch
from urllib.error import HTTPError, URLError

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from collection import services as box_services
from config.exceptions import GENERIC_ERROR_MESSAGE
from development.models import ForkType

from . import services
from .models import UrlRecipeImport

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


@override_settings(DEBUG=False)
class NoGeneric500Tests(TestCase):
    """Requests from audit #137 that used to return a generic 500."""

    def setUp(self) -> None:
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=False)
        self.client.force_login(User.objects.create_user(username="cook", password="strong-pass-1"))

    def test_out_of_range_port_is_refused(self) -> None:
        response = self.client.post(
            URL_IMPORT, {"url": "http://example.com:99999/pie"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            response.json(),
            {"detail": "Enter a valid web address.", "code": "permission_denied"},
        )

    def test_dropped_connection_is_a_fetch_failure(self) -> None:
        errors = (
            http.client.RemoteDisconnected(SENTINEL),
            http.client.BadStatusLine(SENTINEL),
        )
        for error in errors:
            with (
                self.subTest(type(error).__name__),
                patch("library.services._assert_host_public"),
                patch("library.services._urlopen", side_effect=error),
            ):
                response = self.client.post(
                    URL_IMPORT, {"url": "https://example.com/pie"}, format="json"
                )

                self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
                self.assertEqual(
                    response.json(),
                    {"detail": "Could not fetch URL.", "code": "fetch_failed"},
                )
                self.assertNotIn(SENTINEL, response.content.decode())

    def test_dropped_robots_connection_allows_the_fetch(self) -> None:
        errors = (
            http.client.RemoteDisconnected(SENTINEL),
            http.client.BadStatusLine(SENTINEL),
        )
        for error in errors:
            with (
                self.subTest(type(error).__name__),
                patch("library.services._assert_host_public"),
                patch("library.services._urlopen", side_effect=error),
            ):
                self.assertTrue(services.robots_allows("https://example.com/pie"))

    def test_bad_times_in_parsed_data_are_dropped(self) -> None:
        record = UrlRecipeImport.objects.create(
            normalized_url="https://example.com/pie",
            source_title="Pie",
            parsed_data={"name": "Pie", "prepTime": -5, "cookTime": 10**12},
        )

        response = self.client.post(
            f"{URL_IMPORT}{record.id}/save/",
            {"fork_type": ForkType.SAVE_TO_BOX},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.json()["recipe"]["prep_minutes"])
        self.assertIsNone(response.json()["recipe"]["cook_minutes"])

    def test_non_finite_times_are_dropped(self) -> None:
        for value in (float("nan"), float("inf"), "P99999999999D"):
            with self.subTest(value=value):
                self.assertIsNone(services.parse_duration_minutes(value))

    def test_hide_with_bad_reference_id(self) -> None:
        response = self.client.post("/api/v1/references/nope/hide/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()["code"], "not_found")

    def test_scan_with_long_extension_is_saved(self) -> None:
        name = "a." + "x" * 120
        upload = SimpleUploadedFile(name, b"Cookies\n2 cups flour", content_type="text/plain")
        with tempfile.TemporaryDirectory() as media, override_settings(MEDIA_ROOT=media):
            response = self.client.post(
                "/api/v1/imports/scan/", {"file": upload}, format="multipart"
            )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["source_document"]["original_filename"], name)
