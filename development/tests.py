from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from .models import Idea, IdeaStatus

User = get_user_model()


class IdeaAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.list_url = "/api/v1/ideas/"
        self.developer = User.objects.create_user(
            username="dev",
            password="strong-pass-1",
            role="developer",
        )
        self.other_developer = User.objects.create_user(
            username="other-dev",
            password="strong-pass-1",
            role="developer",
        )
        self.home_cook = User.objects.create_user(
            username="cook",
            password="strong-pass-1",
            role="home_cook",
        )

    def test_home_cook_cannot_access_ideas(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_developer_lists_only_own_ideas(self) -> None:
        Idea.objects.create(user=self.developer, title="Corn muffin")
        Idea.objects.create(user=self.other_developer, title="Other idea")
        self.client.force_login(self.developer)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Corn muffin")

    def test_developer_creates_idea_with_title(self) -> None:
        self.client.force_login(self.developer)

        response = self.client.post(
            self.list_url,
            {"title": "Easy Bagel"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Easy Bagel")
        self.assertEqual(response.data["status"], IdeaStatus.RESEARCHING)
        self.assertTrue(
            Idea.objects.filter(user=self.developer, title="Easy Bagel").exists()
        )

    def test_developer_creates_idea_with_optional_image(self) -> None:
        self.client.force_login(self.developer)
        buffer = BytesIO()
        Image.new("RGB", (1, 1), color="red").save(buffer, format="JPEG")
        image = SimpleUploadedFile(
            "bagel.jpg",
            buffer.getvalue(),
            content_type="image/jpeg",
        )

        response = self.client.post(
            self.list_url,
            {"title": "Easy Bagel", "image": image},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["image"].endswith("bagel.jpg"))

    def test_developer_updates_idea(self) -> None:
        idea = Idea.objects.create(user=self.developer, title="Corn muffin")
        self.client.force_login(self.developer)

        response = self.client.patch(
            f"{self.list_url}{idea.id}/",
            {"notes": "Try with honey butter", "status": IdeaStatus.TESTING},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        idea.refresh_from_db()
        self.assertEqual(idea.notes, "Try with honey butter")
        self.assertEqual(idea.status, IdeaStatus.TESTING)

    def test_developer_cannot_access_other_users_idea(self) -> None:
        idea = Idea.objects.create(user=self.other_developer, title="Private idea")
        self.client.force_login(self.developer)

        response = self.client.get(f"{self.list_url}{idea.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_developer_deletes_own_idea(self) -> None:
        idea = Idea.objects.create(user=self.developer, title="Corn muffin")
        self.client.force_login(self.developer)

        response = self.client.delete(f"{self.list_url}{idea.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Idea.objects.filter(id=idea.id).exists())
