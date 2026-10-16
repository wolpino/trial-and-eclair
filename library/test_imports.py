import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Ingredient
from collection.models import CollectionRecipe
from development.models import DevelopmentRecipe, ForkType

from .models import SourceDocument, UrlRecipeImport
from .scan import SCAN_DRAFT_NOTE

User = get_user_model()

FAKE_JPEG = b"\xff\xd8\xff\xe0fake-image"

JSONLD_HTML = """
<html>
  <head>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Recipe",
      "name": "Test Cookies",
      "author": {"@type": "Person", "name": "Ada Baker"},
      "description": "Crisp edges",
      "prepTime": "PT15M",
      "cookTime": "PT12M",
      "recipeIngredient": ["2 cups flour", "1 cup sugar"],
      "recipeInstructions": [
        {"@type": "HowToStep", "text": "Mix dry ingredients."},
        {"@type": "HowToStep", "text": "Bake until golden."}
      ]
    }
    </script>
  </head>
  <body><p>Ignore me</p></body>
</html>
"""


class _FakeHTTPResponse:
    def __init__(self, body: bytes, url: str) -> None:
        self._body = body
        self._url = url

    def read(self, n: int = -1) -> bytes:
        if n is None or n < 0:
            return self._body
        return self._body[:n]

    def geturl(self) -> str:
        return self._url

    def __enter__(self):
        return self

    def __exit__(self, *args) -> bool:
        return False


def _fake_urlopen(request, timeout: float = 8):
    url = request.full_url if hasattr(request, "full_url") else str(request)
    if url.rstrip("/").endswith("robots.txt"):
        return _FakeHTTPResponse(b"User-agent: *\nAllow: /\n", url)
    return _FakeHTTPResponse(JSONLD_HTML.encode(), "https://example.com/cookies")


class UrlImportAPITests(TestCase):
    def setUp(self) -> None:
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=False)
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

    def test_rejects_loopback_ssrf(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.post(
            "/api/v1/imports/url/",
            {"url": "http://127.0.0.1/secret"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(UrlRecipeImport.objects.exists())

    def test_rejects_file_scheme(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.post(
            "/api/v1/imports/url/",
            {"url": "file:///etc/passwd"},
            format="json",
        )

        self.assertIn(
            response.status_code,
            (status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN),
        )
        self.assertFalse(UrlRecipeImport.objects.exists())

    @patch("library.services._assert_host_public")
    @patch("library.services._urlopen", side_effect=_fake_urlopen)
    def test_parses_jsonld_recipe_without_network(self, _mock_urlopen, _mock_host) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.post(
            "/api/v1/imports/url/",
            {"url": "https://example.com/cookies/"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        record = UrlRecipeImport.objects.get(id=response.data["id"])
        self.assertEqual(record.normalized_url, "https://example.com/cookies")
        self.assertEqual(record.source_title, "Test Cookies")
        self.assertEqual(record.source_author, "Ada Baker")
        self.assertEqual(record.source_site, "example.com")
        self.assertEqual(record.parsed_data["name"], "Test Cookies")
        self.assertEqual(len(record.parsed_data["recipeIngredient"]), 2)

        detail = self.client.get(f"/api/v1/imports/url/{record.id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["source_title"], "Test Cookies")

    def _guest_at_limit(self):
        from collection import services as box_services

        guest = User.objects.create_user(username="guest-x", is_guest=True)
        for i in range(box_services.GUEST_CARD_LIMIT):
            box_services.create_box_recipe(guest, title=f"Card {i}")
        return guest

    @patch("library.services._assert_host_public")
    @patch("library.services._urlopen", side_effect=_fake_urlopen)
    def test_guest_at_limit_cannot_save_url_import_to_box(self, _mock_urlopen, _mock_host) -> None:
        guest = self._guest_at_limit()
        self.client.force_login(guest)
        created = self.client.post(
            "/api/v1/imports/url/",
            {"url": "https://example.com/cookies"},
            format="json",
        )

        response = self.client.post(
            f"/api/v1/imports/url/{created.data['id']}/save/",
            {"fork_type": ForkType.SAVE_TO_BOX},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["code"], "guest_card_limit")
        self.assertEqual(guest.recipe_box_items.count(), 5)

    def test_guest_at_limit_cannot_scan_to_box(self) -> None:
        guest = self._guest_at_limit()
        self.client.force_login(guest)
        upload = SimpleUploadedFile("card.txt", b"Cookies\n2 cups flour", content_type="text/plain")

        response = self.client.post(
            "/api/v1/imports/scan/",
            {"file": upload},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["code"], "guest_card_limit")
        self.assertFalse(SourceDocument.objects.exists())

    @patch("library.services._assert_host_public")
    @patch("library.services._urlopen", side_effect=_fake_urlopen)
    def test_save_url_import_to_box_sets_fk_without_fork(self, _mock_urlopen, _mock_host) -> None:
        self.client.force_login(self.home_cook)
        created = self.client.post(
            "/api/v1/imports/url/",
            {"url": "https://example.com/cookies"},
            format="json",
        )
        import_id = created.data["id"]
        catalog_count = Ingredient.objects.count()

        response = self.client.post(
            f"/api/v1/imports/url/{import_id}/save/",
            {"fork_type": ForkType.SAVE_TO_BOX},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        recipe = CollectionRecipe.objects.get(id=response.data["recipe"]["id"])
        self.assertEqual(recipe.source_type, "web")
        self.assertEqual(Ingredient.objects.count(), catalog_count)
        self.assertEqual(
            [line.raw_text for line in recipe.ingredient_lines.all()],
            ["2 cups flour", "1 cup sugar"],
        )
        self.assertTrue(all(line.ingredient_id is None for line in recipe.ingredient_lines.all()))
        self.assertTrue(all(line.quantity is None for line in recipe.ingredient_lines.all()))
        self.assertEqual(recipe.title, "Test Cookies")
        self.assertEqual(str(recipe.url_import_id), str(import_id))
        self.assertIsNone(recipe.fork_record_id)
        self.assertEqual(recipe.ingredient_lines.count(), 2)
        self.assertEqual(recipe.steps.count(), 2)

    @patch("library.services._assert_host_public")
    @patch("library.services._urlopen", side_effect=_fake_urlopen)
    def test_home_cook_cannot_save_url_import_as_rework(self, _mock_urlopen, _mock_host) -> None:
        self.client.force_login(self.home_cook)
        created = self.client.post(
            "/api/v1/imports/url/",
            {"url": "https://example.com/cookies"},
            format="json",
        )

        response = self.client.post(
            f"/api/v1/imports/url/{created.data['id']}/save/",
            {"fork_type": ForkType.REWORK},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(DevelopmentRecipe.objects.filter(user=self.home_cook).exists())

    @patch("library.services._assert_host_public")
    @patch("library.services._urlopen", side_effect=_fake_urlopen)
    def test_duplicate_url_returns_cached_import(self, mock_urlopen, _mock_host) -> None:
        self.client.force_login(self.home_cook)
        first = self.client.post(
            "/api/v1/imports/url/",
            {"url": "https://Example.com/cookies/"},
            format="json",
        )
        calls_after_first = mock_urlopen.call_count
        second = self.client.post(
            "/api/v1/imports/url/",
            {"url": "https://example.com/cookies"},
            format="json",
        )

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_201_CREATED)
        self.assertEqual(first.data["id"], second.data["id"])
        self.assertEqual(UrlRecipeImport.objects.count(), 1)
        self.assertEqual(mock_urlopen.call_count, calls_after_first)


RECIPE_TEXT = """Grandma Cookies

Ingredients
2 cups flour
1 cup sugar

Directions
Mix dry ingredients.
Bake until golden.
"""


class ScanImportAPITests(TestCase):
    def setUp(self) -> None:
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=False)
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

    def test_upload_creates_source_document_and_box_draft(self) -> None:
        self.client.force_login(self.home_cook)
        upload = SimpleUploadedFile(
            "grandma-cookies.txt",
            RECIPE_TEXT.encode(),
            content_type="text/plain",
        )
        catalog_count = Ingredient.objects.count()

        response = self.client.post(
            "/api/v1/imports/scan/",
            {"file": upload},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["destination"], "box")
        scanned = CollectionRecipe.objects.get(id=response.data["recipe"]["id"])
        self.assertEqual(scanned.source_type, "scan")
        self.assertEqual(Ingredient.objects.count(), catalog_count)
        self.assertEqual(
            [line.raw_text for line in scanned.ingredient_lines.all()],
            ["2 cups flour", "1 cup sugar"],
        )
        self.assertTrue(all(line.ingredient_id is None for line in scanned.ingredient_lines.all()))
        document = SourceDocument.objects.get(id=response.data["source_document"]["id"])
        self.assertEqual(document.user, self.home_cook)
        self.assertEqual(document.original_filename, "grandma-cookies.txt")
        self.assertIn("2 cups flour", document.extracted_text)
        recipe = CollectionRecipe.objects.get(id=response.data["recipe"]["id"])
        self.assertEqual(recipe.title, "Grandma Cookies")
        self.assertEqual(recipe.source_document_id, document.id)
        self.assertEqual(recipe.ingredient_lines.count(), 2)
        self.assertEqual(recipe.steps.count(), 2)

    @patch("library.scan.shutil.which", return_value=None)
    def test_image_without_tesseract_opens_empty_draft(self, _mock_which) -> None:
        self.client.force_login(self.home_cook)
        upload = SimpleUploadedFile(
            "card.jpg",
            FAKE_JPEG,
            content_type="image/jpeg",
        )

        response = self.client.post(
            "/api/v1/imports/scan/",
            {"file": upload},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        document = SourceDocument.objects.get(id=response.data["source_document"]["id"])
        self.assertEqual(document.extracted_text, "")
        recipe = CollectionRecipe.objects.get(id=response.data["recipe"]["id"])
        self.assertEqual(recipe.title, "card")
        self.assertEqual(recipe.description, SCAN_DRAFT_NOTE)
        self.assertEqual(recipe.ingredient_lines.count(), 0)

    @patch("library.scan.subprocess.run")
    @patch("library.scan.shutil.which", return_value="/usr/bin/tesseract")
    def test_image_ocr_fills_extracted_text_and_lines(self, _mock_which, mock_run) -> None:
        mock_run.return_value = MagicMock(returncode=0, stdout=RECIPE_TEXT.encode())
        self.client.force_login(self.home_cook)
        upload = SimpleUploadedFile(
            "card.jpg",
            FAKE_JPEG,
            content_type="image/jpeg",
        )

        response = self.client.post(
            "/api/v1/imports/scan/",
            {"file": upload},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        document = SourceDocument.objects.get(id=response.data["source_document"]["id"])
        self.assertIn("Grandma Cookies", document.extracted_text)
        recipe = CollectionRecipe.objects.get(id=response.data["recipe"]["id"])
        self.assertEqual(recipe.title, "Grandma Cookies")
        self.assertEqual(recipe.ingredient_lines.count(), 2)
        self.assertEqual(recipe.steps.count(), 2)
        mock_run.assert_called_once()
        args = mock_run.call_args.args[0]
        self.assertEqual(args[0], "/usr/bin/tesseract")
        self.assertIn("stdout", args)

    def test_home_cook_cannot_scan_to_lab(self) -> None:
        self.client.force_login(self.home_cook)
        upload = SimpleUploadedFile("note.txt", b"x", content_type="text/plain")

        response = self.client.post(
            "/api/v1/imports/scan/",
            {"file": upload, "destination": "lab"},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(DevelopmentRecipe.objects.filter(user=self.home_cook).exists())

    @patch("library.scan.shutil.which", return_value=None)
    def test_developer_scan_to_lab_uses_version_notes(self, _mock_which) -> None:
        self.client.force_login(self.developer)
        upload = SimpleUploadedFile(
            "lab-scan.jpg",
            FAKE_JPEG,
            content_type="image/jpeg",
        )

        response = self.client.post(
            "/api/v1/imports/scan/",
            {"file": upload, "destination": "lab"},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        recipe = DevelopmentRecipe.objects.get(id=response.data["recipe"]["id"])
        self.assertEqual(recipe.title, "lab-scan")
        self.assertEqual(recipe.current_version.version_notes, SCAN_DRAFT_NOTE)
        self.assertTrue(SourceDocument.objects.filter(user=self.developer).exists())


def _rate_count(scope: str) -> int:
    return int(settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"][scope].split("/")[0])


class ImportThrottleTests(TestCase):
    def setUp(self) -> None:
        cache.clear()
        self.addCleanup(cache.clear)
        self.cook = User.objects.create_user(username="cook", password="strong-pass-1")
        self.guest = User.objects.create_user(username="guest-1", is_guest=True)

    def _client(self, user) -> APIClient:
        client = APIClient()
        client.force_login(user)
        return client

    def _exhaust(self, client: APIClient, url: str, times: int) -> None:
        for _ in range(times):
            response = client.post(url, {}, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def _assert_throttled(self, response) -> None:
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn("Retry-After", response.headers)

    def test_url_import_is_throttled_per_user(self) -> None:
        url = "/api/v1/imports/url/"
        client = self._client(self.cook)
        self._exhaust(client, url, _rate_count("url_import"))

        self._assert_throttled(client.post(url, {}, format="json"))
        other = User.objects.create_user(username="other", password="strong-pass-1")
        self.assertEqual(
            self._client(other).post(url, {}, format="json").status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_scan_import_is_throttled_per_user(self) -> None:
        url = "/api/v1/imports/scan/"
        client = self._client(self.cook)
        self._exhaust(client, url, _rate_count("scan_import"))

        self._assert_throttled(client.post(url, {}, format="json"))

    def test_guests_hit_a_lower_import_rate(self) -> None:
        for scope, url in (("url_import", "/api/v1/imports/url/"), ("scan_import", "/api/v1/imports/scan/")):
            guest_limit = _rate_count(f"{scope}_guest")
            self.assertLess(guest_limit, _rate_count(scope))
            guest_client = self._client(self.guest)
            cook_client = self._client(self.cook)
            self._exhaust(guest_client, url, guest_limit)
            self._exhaust(cook_client, url, guest_limit)

            self._assert_throttled(guest_client.post(url, {}, format="json"))
            self.assertEqual(
                cook_client.post(url, {}, format="json").status_code,
                status.HTTP_400_BAD_REQUEST,
            )


class ScanUploadLimitTests(TestCase):
    def setUp(self) -> None:
        cache.clear()
        media = tempfile.TemporaryDirectory()
        self.addCleanup(media.cleanup)
        self.media_root = Path(media.name)
        override = override_settings(MEDIA_ROOT=self.media_root)
        override.enable()
        self.addCleanup(override.disable)
        self.client = APIClient()
        self.client.force_login(User.objects.create_user(username="cook", password="strong-pass-1"))

    def _post(self, upload):
        return self.client.post("/api/v1/imports/scan/", {"file": upload}, format="multipart")

    def _assert_rejected(self, response) -> None:
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data)
        self.assertFalse(SourceDocument.objects.exists())
        self.assertFalse(CollectionRecipe.objects.exists())
        self.assertEqual([p for p in self.media_root.rglob("*") if p.is_file()], [])

    def test_upload_over_size_cap_is_rejected(self) -> None:
        size = settings.SCAN_UPLOAD_MAX_BYTES + 1
        upload = SimpleUploadedFile("big.txt", b"a" * size, content_type="text/plain")

        self._assert_rejected(self._post(upload))

    def test_unsupported_type_is_rejected(self) -> None:
        upload = SimpleUploadedFile("card.gif", b"GIF89a\x01\x00\x01\x00\x00\x00", content_type="image/gif")

        self._assert_rejected(self._post(upload))

    def test_content_that_does_not_match_an_allowed_type_is_rejected(self) -> None:
        upload = SimpleUploadedFile("card.jpg", b"MZ\x90\x00\x03\x00\x00\x00", content_type="image/jpeg")

        self._assert_rejected(self._post(upload))

    @patch("library.scan.shutil.which", return_value=None)
    def test_allowed_types_are_accepted(self, _mock_which) -> None:
        uploads = [
            ("card.jpg", FAKE_JPEG, "image/jpeg"),
            ("card.png", b"\x89PNG\r\n\x1a\n\x00\x00", "image/png"),
            ("card.heic", b"\x00\x00\x00\x18ftypheic\x00\x00\x00\x00", "image/heic"),
            ("card.pdf", b"%PDF-1.7\n", "application/pdf"),
            ("card.txt", b"Cookies\n2 cups flour", "text/plain"),
        ]
        for name, body, content_type in uploads:
            with self.subTest(name=name):
                response = self._post(SimpleUploadedFile(name, body, content_type=content_type))
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)
