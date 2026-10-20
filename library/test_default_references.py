from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Reference, ReferenceType

User = get_user_model()

REFERENCES_URL = "/api/v1/references/"
DEFAULT_TITLES = {"King Arthur Baking recipes", "Sally's Baking Addiction"}


def load_defaults() -> None:
    call_command("load_default_references", stdout=StringIO())


class LoadDefaultReferencesTests(TestCase):
    def test_command_is_idempotent_and_creates_no_users(self) -> None:
        load_defaults()
        load_defaults()

        defaults = Reference.objects.filter(user__isnull=True)
        self.assertEqual({ref.title for ref in defaults}, DEFAULT_TITLES)
        self.assertEqual(defaults.count(), 2)
        self.assertEqual(User.objects.count(), 0)


class DefaultReferenceAPITests(TestCase):
    def setUp(self) -> None:
        load_defaults()
        self.client = APIClient()
        self.cook = User.objects.create_user(username="cook", password="strong-pass-1")
        self.other = User.objects.create_user(username="other", password="strong-pass-1")
        self.king_arthur = Reference.objects.get(
            user__isnull=True, title="King Arthur Baking recipes"
        )

    def _titles(self) -> set[str]:
        response = self.client.get(REFERENCES_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return {item["title"] for item in response.data}

    def test_new_user_list_includes_both_defaults(self) -> None:
        self.client.force_login(self.cook)

        response = self.client.get(REFERENCES_URL)

        defaults = [item for item in response.data if item["is_default"]]
        self.assertEqual({item["title"] for item in defaults}, DEFAULT_TITLES)
        self.assertEqual(defaults[0]["links"], [])

    def test_hiding_a_default_removes_it_for_that_user_only(self) -> None:
        self.client.force_login(self.cook)
        hide_url = f"{REFERENCES_URL}{self.king_arthur.id}/hide/"

        self.assertEqual(self.client.post(hide_url).status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.client.post(hide_url).status_code, status.HTTP_204_NO_CONTENT)

        self.assertEqual(self._titles(), {"Sally's Baking Addiction"})
        self.client.force_login(self.other)
        self.assertEqual(self._titles(), DEFAULT_TITLES)
        self.assertTrue(Reference.objects.filter(pk=self.king_arthur.pk).exists())

    def test_default_cannot_be_edited_or_deleted(self) -> None:
        self.client.force_login(self.cook)
        detail_url = f"{REFERENCES_URL}{self.king_arthur.id}/"

        patch = self.client.patch(detail_url, {"title": "Mine now"}, format="json")
        delete = self.client.delete(detail_url)

        self.assertEqual(patch.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(patch.data["code"], "permission_denied")
        self.assertEqual(delete.status_code, status.HTTP_403_FORBIDDEN)
        self.king_arthur.refresh_from_db()
        self.assertEqual(self.king_arthur.title, "King Arthur Baking recipes")

    def test_default_cannot_take_links(self) -> None:
        self.client.force_login(self.cook)

        response = self.client.post(
            f"{REFERENCES_URL}{self.king_arthur.id}/links/", {"note": "x"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_personal_references_behave_as_before(self) -> None:
        self.client.force_login(self.cook)
        created = self.client.post(
            REFERENCES_URL,
            {"ref_type": ReferenceType.BLOG, "title": "My blog"},
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertFalse(created.data["is_default"])
        detail_url = f"{REFERENCES_URL}{created.data['id']}/"

        patch = self.client.patch(detail_url, {"title": "My blog 2"}, format="json")
        hide = self.client.post(f"{detail_url}hide/")
        self.client.force_login(self.other)
        other_titles = self._titles()
        self.client.force_login(self.cook)
        delete = self.client.delete(detail_url)

        self.assertEqual(patch.status_code, status.HTTP_200_OK)
        self.assertEqual(hide.status_code, status.HTTP_404_NOT_FOUND)
        self.assertNotIn("My blog 2", other_titles)
        self.assertEqual(delete.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self._titles(), DEFAULT_TITLES)
