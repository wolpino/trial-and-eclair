from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from collection.models import CollectionRecipe
from development.models import DevelopmentRecipe, ForkType

from .models import SourceDocument, UrlRecipeImport
from .services import SCAN_DRAFT_NOTE

User = get_user_model()

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

        response = self.client.post(
            f"/api/v1/imports/url/{import_id}/save/",
            {"fork_type": ForkType.SAVE_TO_BOX},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        recipe = CollectionRecipe.objects.get(id=response.data["recipe"]["id"])
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


class ScanImportAPITests(TestCase):
    def setUp(self) -> None:
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
            b"scan-bytes",
            content_type="text/plain",
        )

        response = self.client.post(
            "/api/v1/imports/scan/",
            {"file": upload},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["destination"], "box")
        document = SourceDocument.objects.get(id=response.data["source_document"]["id"])
        self.assertEqual(document.user, self.home_cook)
        self.assertEqual(document.original_filename, "grandma-cookies.txt")
        self.assertEqual(document.extracted_text, "")
        recipe = CollectionRecipe.objects.get(id=response.data["recipe"]["id"])
        self.assertEqual(recipe.title, "grandma-cookies")
        self.assertEqual(recipe.description, SCAN_DRAFT_NOTE)
        self.assertEqual(recipe.source_document_id, document.id)
        self.assertEqual(recipe.ingredient_lines.count(), 0)
        self.assertEqual(recipe.steps.count(), 0)

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

    def test_developer_scan_to_lab_uses_version_notes(self) -> None:
        self.client.force_login(self.developer)
        upload = SimpleUploadedFile(
            "lab-scan.jpg",
            b"fake-image",
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
