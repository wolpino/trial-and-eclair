from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from . import services
from .models import DevelopmentRecipe, JournalEntry

User = get_user_model()


class JournalAPITests(TestCase):
    def setUp(self) -> None:
        self.client = APIClient(enforce_csrf_checks=False)
        self.journal_url = "/api/v1/journal/"
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
        self.recipe = services.create_development_recipe(self.developer, title="Corn muffin")
        self.other_recipe = services.create_development_recipe(
            self.other_developer,
            title="Other recipe",
        )

    def test_home_cook_cannot_access_journal(self) -> None:
        self.client.force_login(self.home_cook)

        response = self.client.get(self.journal_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_developer_creates_journal_entry(self) -> None:
        self.client.force_login(self.developer)

        response = self.client.post(
            self.journal_url,
            {
                "recipe": str(self.recipe.id),
                "title": "First bake",
                "body": "Crisp edges, soft center.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["body"], "Crisp edges, soft center.")
        self.assertTrue(
            JournalEntry.objects.filter(user=self.developer, recipe=self.recipe).exists()
        )

    def test_developer_creates_entry_with_version_snapshot(self) -> None:
        self.client.force_login(self.developer)
        version = self.recipe.current_version

        response = self.client.post(
            self.journal_url,
            {
                "recipe": str(self.recipe.id),
                "version_snapshot": str(version.id),
                "body": "Testing v1 hydration.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(str(response.data["version_snapshot"]), str(version.id))

    def test_developer_lists_entries_filtered_by_recipe(self) -> None:
        JournalEntry.objects.create(
            user=self.developer,
            recipe=self.recipe,
            body="Entry for corn muffin",
        )
        other = services.create_development_recipe(self.developer, title="Bagel")
        JournalEntry.objects.create(
            user=self.developer,
            recipe=other,
            body="Entry for bagel",
        )
        self.client.force_login(self.developer)

        response = self.client.get(self.journal_url, {"recipe": str(self.recipe.id)})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["body"], "Entry for corn muffin")

    def test_developer_updates_and_deletes_entry(self) -> None:
        entry = JournalEntry.objects.create(
            user=self.developer,
            recipe=self.recipe,
            body="Draft note",
        )
        self.client.force_login(self.developer)

        patch_response = self.client.patch(
            f"{self.journal_url}{entry.id}/",
            {"body": "Updated note"},
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)

        delete_response = self.client.delete(f"{self.journal_url}{entry.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(JournalEntry.objects.filter(id=entry.id).exists())

    def test_developer_cannot_use_other_users_recipe(self) -> None:
        self.client.force_login(self.developer)

        response = self.client.post(
            self.journal_url,
            {
                "recipe": str(self.other_recipe.id),
                "body": "Should fail",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_developer_cannot_access_other_users_entry(self) -> None:
        entry = JournalEntry.objects.create(
            user=self.other_developer,
            recipe=self.other_recipe,
            body="Private",
        )
        self.client.force_login(self.developer)

        response = self.client.get(f"{self.journal_url}{entry.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_rejects_version_snapshot_from_wrong_recipe(self) -> None:
        self.client.force_login(self.developer)
        other_version = self.other_recipe.current_version

        response = self.client.post(
            self.journal_url,
            {
                "recipe": str(self.recipe.id),
                "version_snapshot": str(other_version.id),
                "body": "Mismatch",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
