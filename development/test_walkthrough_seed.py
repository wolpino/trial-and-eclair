"""Local walkthrough fixtures.

Expired trials, hidden forks, and an empty box stay in their own tests:
accounts.test_subscription.DeveloperSubscriptionTests.test_expired_trial_blocks_developer_endpoints,
development.test_publish.PublishAPITests.test_public_recipe_hides_fork_lineage_when_author_opted_out,
and collection.tests.RecipeBoxAPITests.test_empty_box_lists_no_cards.
"""

from __future__ import annotations

import os
import tempfile
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings

from collection.models import CollectionRecipe
from library.models import ReferenceLink, SourceDocument, UrlRecipeImport

from .models import DevelopmentRecipe, TestSessionPhoto

User = get_user_model()


class WalkthroughFixtureTests(TestCase):
    def setUp(self) -> None:
        self._media = tempfile.TemporaryDirectory(dir=settings.BASE_DIR)
        self._media_settings = override_settings(MEDIA_ROOT=self._media.name)
        self._media_settings.enable()

    def tearDown(self) -> None:
        self._media_settings.disable()
        self._media.cleanup()

    def test_load_adds_import_scan_photos_and_version_link(self) -> None:
        call_command("load_recipe_seed", "--force")
        cook = User.objects.get(username="cook")
        dev = User.objects.get(username="dev")
        baker = User.objects.get(username="baker")

        cached = UrlRecipeImport.objects.get(
            normalized_url="https://example.com/recipes/olive-oil-cake"
        )
        self.assertEqual(cached.source_title, "Olive Oil Cake")
        self.assertFalse(cached.fetch_error)
        saved = CollectionRecipe.objects.get(user=cook, title="Olive Oil Cake")
        self.assertEqual(saved.url_import_id, cached.id)

        draft = CollectionRecipe.objects.get(user=cook, title="Weekday Soda Bread")
        document = SourceDocument.objects.get(user=cook, original_filename="weekday-soda-bread.txt")
        self.assertEqual(draft.source_document_id, document.id)
        self.assertIn("buttermilk", document.extracted_text.lower())
        self.assertGreaterEqual(draft.ingredient_lines.count(), 1)
        self.assertGreaterEqual(draft.steps.count(), 1)

        pistachio = DevelopmentRecipe.objects.get(
            user=dev,
            title="Pistachio Shortbread with Rose Buttercream",
        )
        photos = TestSessionPhoto.objects.filter(session__version__recipe=pistachio)
        self.assertEqual(photos.count(), 2)
        self.assertTrue(all(photo.image for photo in photos))

        muffins = DevelopmentRecipe.objects.get(user=dev, title="Raisin Bran Muffins")
        link = ReferenceLink.objects.get(recipe_version=muffins.published_version)
        self.assertEqual(link.reference.title, "The Perfect Loaf")
        self.assertIn("soak", link.note.lower())

        self.assertTrue(dev.has_developer_access())
        self.assertTrue(baker.show_forks)
        self.assertGreater(cook.collection_recipes.count(), 0)
        public = self.client.get("/api/v1/public/recipes/brown-butter-blondies-lab/")
        self.assertEqual(public.status_code, 200)
        self.assertIsNotNone(public.json()["fork_lineage"])


class WalkthroughHostGuardTests(TestCase):
    @override_settings(ALLOWED_HOSTS=["trial-and-eclair.example"])
    def test_refuses_public_allowed_host(self) -> None:
        with self.assertRaises(CommandError) as raised:
            call_command("load_recipe_seed")

        self.assertIn("public host", str(raised.exception))
        self.assertFalse(User.objects.filter(username="dev").exists())

    def test_refuses_render_hostname(self) -> None:
        with patch.dict(os.environ, {"RENDER_EXTERNAL_HOSTNAME": "app.onrender.com"}):
            with self.assertRaises(CommandError) as raised:
                call_command("load_recipe_seed")

        self.assertIn("public host", str(raised.exception))
        self.assertFalse(User.objects.filter(username="cook").exists())
