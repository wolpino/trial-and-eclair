"""Staging demo accounts loaded from env-var passwords (load_demo_data)."""

from __future__ import annotations

import io
import os
import secrets
import tempfile
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings

from accounts.models import UserRole
from collection.models import CollectionRecipe
from library.models import Reference

from .models import Cookbook, DevelopmentRecipe, Idea

User = get_user_model()
DEMO_KEYS = (
    "DEMO_DEVELOPER_USERNAME",
    "DEMO_DEVELOPER_PASSWORD",
    "DEMO_COOK_USERNAME",
    "DEMO_COOK_PASSWORD",
)


def _counts() -> dict[str, int]:
    return {
        "users": User.objects.count(),
        "ideas": Idea.objects.count(),
        "recipes": DevelopmentRecipe.objects.count(),
        "references": Reference.objects.count(),
        "cookbooks": Cookbook.objects.count(),
        "cards": CollectionRecipe.objects.count(),
    }


class DemoDataTests(TestCase):
    def setUp(self) -> None:
        self._media = tempfile.TemporaryDirectory(dir=settings.BASE_DIR)
        self._media_settings = override_settings(MEDIA_ROOT=self._media.name)
        self._media_settings.enable()
        self.dev_password = secrets.token_urlsafe(16)
        self.cook_password = secrets.token_urlsafe(16)
        self.env = {
            "DEMO_DEVELOPER_PASSWORD": self.dev_password,
            "DEMO_COOK_PASSWORD": self.cook_password,
        }

    def tearDown(self) -> None:
        self._media_settings.disable()
        self._media.cleanup()

    def _run(self, env: dict[str, str] | None = None) -> str:
        out = io.StringIO()
        with patch.dict(os.environ):
            for key in DEMO_KEYS:
                os.environ.pop(key, None)
            os.environ.update(self.env if env is None else env)
            call_command("load_demo_data", stdout=out, stderr=out)
        return out.getvalue()

    def test_creates_two_demo_users_with_roles_and_developer_access(self) -> None:
        self._run()

        dev = User.objects.get(username="demo-developer")
        cook = User.objects.get(username="demo-cook")
        self.assertEqual(dev.role, UserRole.DEVELOPER)
        self.assertEqual(cook.role, UserRole.HOME_COOK)
        self.assertTrue(dev.has_developer_access())
        self.assertEqual(User.objects.count(), 2)

        self.assertTrue(
            self.client.login(username="demo-developer", password=self.dev_password)
        )
        self.assertEqual(self.client.get("/api/v1/ideas/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/recipes/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/cookbooks/").status_code, 200)
        self.assertTrue(self.client.login(username="demo-cook", password=self.cook_password))

    def test_usernames_come_from_env(self) -> None:
        self._run(
            {
                **self.env,
                "DEMO_DEVELOPER_USERNAME": "tester-dev",
                "DEMO_COOK_USERNAME": "tester-cook",
            }
        )

        self.assertTrue(User.objects.filter(username="tester-dev").exists())
        self.assertTrue(User.objects.filter(username="tester-cook").exists())
        self.assertFalse(User.objects.filter(username="demo-developer").exists())

    def test_fills_developer_and_cook_content(self) -> None:
        self._run()
        dev = User.objects.get(username="demo-developer")
        cook = User.objects.get(username="demo-cook")

        self.assertGreater(Idea.objects.filter(user=dev).count(), 0)
        self.assertGreater(DevelopmentRecipe.objects.filter(user=dev).count(), 0)
        self.assertGreater(Reference.objects.filter(user=dev).count(), 0)
        self.assertGreater(Cookbook.objects.filter(user=dev).count(), 0)
        self.assertGreater(CollectionRecipe.objects.filter(user=cook).count(), 0)
        self.assertGreater(Reference.objects.filter(user=cook).count(), 0)

    def test_second_run_changes_nothing_and_keeps_edits(self) -> None:
        self._run()
        card = CollectionRecipe.objects.filter(user__username="demo-cook").first()
        assert card is not None
        card.title = "Tester renamed this"
        card.save(update_fields=["title"])
        before = _counts()

        self._run()

        self.assertEqual(_counts(), before)
        card.refresh_from_db()
        self.assertEqual(card.title, "Tester renamed this")

    def test_deleted_user_is_recreated_and_other_left_alone(self) -> None:
        self._run()
        cook = User.objects.get(username="demo-cook")
        card = CollectionRecipe.objects.filter(user=cook).first()
        assert card is not None
        card.title = "Tester renamed this"
        card.save(update_fields=["title"])
        cook_cards = CollectionRecipe.objects.filter(user=cook).count()
        dev = User.objects.get(username="demo-developer")
        dev_ideas = Idea.objects.filter(user=dev).count()
        dev.delete()  # One step: cookbook entries are copies and go with the user.

        self._run()

        new_dev = User.objects.get(username="demo-developer")
        self.assertNotEqual(new_dev.pk, dev.pk)
        self.assertEqual(Idea.objects.filter(user=new_dev).count(), dev_ideas)
        self.assertGreater(Cookbook.objects.filter(user=new_dev).count(), 0)
        self.assertEqual(User.objects.get(username="demo-cook").pk, cook.pk)
        self.assertEqual(CollectionRecipe.objects.filter(user=cook).count(), cook_cards)
        card.refresh_from_db()
        self.assertEqual(card.title, "Tester renamed this")

    def test_missing_password_creates_nothing(self) -> None:
        out = self._run({"DEMO_DEVELOPER_PASSWORD": self.dev_password})

        self.assertEqual(User.objects.count(), 0)
        self.assertIn("DEMO_COOK_PASSWORD", out)

    def test_short_password_creates_nothing(self) -> None:
        out = self._run({**self.env, "DEMO_COOK_PASSWORD": "short"})

        self.assertEqual(User.objects.count(), 0)
        self.assertNotIn("short", out)

    def test_runs_on_render_while_walkthrough_seed_refuses(self) -> None:
        with patch.dict(os.environ, {"RENDER_EXTERNAL_HOSTNAME": "app.onrender.com"}):
            self._run()
            with self.assertRaises(CommandError):
                call_command("load_recipe_seed")

        self.assertTrue(User.objects.filter(username="demo-developer").exists())
        self.assertFalse(User.objects.filter(username="dev").exists())

    def test_output_never_contains_passwords(self) -> None:
        out = self._run()
        out += self._run()

        self.assertNotIn(self.dev_password, out)
        self.assertNotIn(self.cook_password, out)
