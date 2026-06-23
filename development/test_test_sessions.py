from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from . import services

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
