from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework import status
from rest_framework.response import Response
from rest_framework.test import APIClient

from . import services
from .models import TestSession

User = get_user_model()


def _test_image(name: str = "photo.jpg") -> SimpleUploadedFile:
    buffer = BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buffer, format="JPEG")
    buffer.seek(0)
    return SimpleUploadedFile(name, buffer.read(), content_type="image/jpeg")


class TestSessionAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.client.force_login(self.developer)
        recipe = services.create_development_recipe(self.developer, title="Corn muffin")
        self.version = recipe.current_version

    def test_create_list_and_delete_test_session(self) -> None:
        sessions_url = f"/api/v1/versions/{self.version.id}/test-sessions/"

        create_response = self.client.post(
            sessions_url,
            {"notes": "First bake", "outcome": "Too dense"},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        session_id = create_response.data["id"]

        list_response = self.client.get(sessions_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

        delete_response = self.client.delete(f"{sessions_url}{session_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_add_photos_up_to_five(self) -> None:
        sessions_url = f"/api/v1/versions/{self.version.id}/test-sessions/"
        session_id = self.client.post(
            sessions_url,
            {"notes": "Photo test"},
            format="json",
        ).data["id"]
        photos_url = f"/api/v1/test-sessions/{session_id}/photos/"

        for index in range(5):
            response = self.client.post(
                photos_url,
                {"image": _test_image(f"photo-{index}.jpg"), "caption": f"Shot {index}"},
                format="multipart",
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        sixth = self.client.post(
            photos_url,
            {"image": _test_image("photo-6.jpg")},
            format="multipart",
        )
        self.assertEqual(sixth.status_code, status.HTTP_400_BAD_REQUEST)


BAKE_FIELDS = ("oven_temp", "oven_temp_unit", "bake_minutes", "rating")


class TestSessionBakeFieldsTests(TestCase):
    """Oven temperature, bake time and rating on a test session (#91)."""

    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.client.force_login(self.developer)
        recipe = services.create_development_recipe(self.developer, title="Shortbread")
        self.version = recipe.current_version
        self.sessions_url = f"/api/v1/versions/{self.version.id}/test-sessions/"

    def _create(self, data: dict) -> Response:
        return self.client.post(self.sessions_url, data, format="json")

    def test_create_without_bake_fields_saves_nulls(self) -> None:
        response = self._create({"notes": "Plain session"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        for field in BAKE_FIELDS:
            self.assertIsNone(response.data[field], field)

    def test_create_with_bake_fields_reads_back(self) -> None:
        response = self._create(
            {"oven_temp": 350, "oven_temp_unit": "F", "bake_minutes": 25, "rating": 4}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        session = self.client.get(f"{self.sessions_url}{response.data['id']}/").data
        self.assertEqual(session["oven_temp"], 350)
        self.assertEqual(session["oven_temp_unit"], "F")
        self.assertEqual(session["bake_minutes"], 25)
        self.assertEqual(session["rating"], 4)

    def test_celsius_is_stored_as_typed(self) -> None:
        response = self._create({"oven_temp": 180, "oven_temp_unit": "C"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["oven_temp"], 180)
        self.assertEqual(response.data["oven_temp_unit"], "C")

    def test_rating_accepts_one_to_five_only(self) -> None:
        for rating in (1, 5):
            response = self._create({"rating": rating})
            self.assertEqual(response.status_code, status.HTTP_201_CREATED, rating)
        for rating in (0, 6, -1):
            response = self._create({"rating": rating})
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, rating)
            self.assertIn("rating", response.data)

    def test_negative_bake_minutes_is_refused(self) -> None:
        response = self._create({"bake_minutes": -5})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("bake_minutes", response.data)

    def test_negative_oven_temp_is_refused(self) -> None:
        response = self._create({"oven_temp": -10, "oven_temp_unit": "C"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("oven_temp", response.data)

    def test_unknown_temp_unit_is_refused(self) -> None:
        response = self._create({"oven_temp": 450, "oven_temp_unit": "K"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("oven_temp_unit", response.data)

    def test_oven_temp_without_unit_is_refused(self) -> None:
        response = self._create({"oven_temp": 350})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("oven_temp_unit", response.data)

    def test_patch_sets_rating_on_existing_session(self) -> None:
        session_id = self._create({"notes": "Rate later"}).data["id"]

        response = self.client.patch(
            f"{self.sessions_url}{session_id}/", {"rating": 3}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["rating"], 3)

    def test_old_sessions_read_back_with_nulls(self) -> None:
        TestSession.objects.create(version=self.version, notes="Before #91")

        sessions = self.client.get(self.sessions_url).data

        self.assertEqual(len(sessions), 1)
        self.assertEqual(sessions[0]["notes"], "Before #91")
        for field in BAKE_FIELDS:
            self.assertIsNone(sessions[0][field], field)
