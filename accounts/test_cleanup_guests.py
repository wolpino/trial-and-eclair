import tempfile
from datetime import timedelta
from io import StringIO
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.utils import timezone

from collection.models import CollectionRecipe, RecipeBoxItem
from collection.services import create_box_recipe
from library.models import SourceDocument

User = get_user_model()


class CleanupGuestsCommandTests(TestCase):
    def setUp(self) -> None:
        media = tempfile.TemporaryDirectory()
        self.addCleanup(media.cleanup)
        override = override_settings(MEDIA_ROOT=Path(media.name))
        override.enable()
        self.addCleanup(override.disable)
        self.old = timezone.now() - timedelta(days=45)

    def _guest(self, name: str, *, joined=None, last_login=None) -> User:
        user = User.objects.create_user(username=name, is_guest=True)
        User.objects.filter(pk=user.pk).update(
            date_joined=joined or self.old,
            last_login=last_login or joined or self.old,
        )
        return user

    def _card_with_files(self, user) -> tuple[CollectionRecipe, SourceDocument]:
        document = SourceDocument.objects.create(
            user=user,
            file=ContentFile(b"Cookies", name="scan.txt"),
            original_filename="scan.txt",
        )
        recipe = create_box_recipe(user, title="Cookies", source_document=document)
        recipe.hero_image.save("hero.jpg", ContentFile(b"\xff\xd8\xff"), save=True)
        CollectionRecipe.objects.filter(pk=recipe.pk).update(updated_at=self.old)
        RecipeBoxItem.objects.filter(recipe=recipe).update(updated_at=self.old)
        return recipe, document

    def _run(self, *args: str) -> str:
        out = StringIO()
        call_command("cleanup_guests", *args, stdout=out)
        return out.getvalue()

    def test_deletes_idle_guests_and_their_files(self) -> None:
        idle = self._guest("guest-idle")
        recipe, document = self._card_with_files(idle)
        storage = document.file.storage
        paths = [document.file.name, recipe.hero_image.name]
        self.assertTrue(all(storage.exists(p) for p in paths))

        output = self._run("--days", "30")

        self.assertFalse(User.objects.filter(pk=idle.pk).exists())
        self.assertFalse(CollectionRecipe.objects.filter(pk=recipe.pk).exists())
        self.assertFalse(any(storage.exists(p) for p in paths))
        self.assertIn("1 guest", output)

    def test_keeps_signed_up_users_and_recent_guests(self) -> None:
        member = User.objects.create_user(username="member", password="strong-pass-1")
        User.objects.filter(pk=member.pk).update(date_joined=self.old, last_login=self.old)
        self._guest("guest-login", last_login=timezone.now() - timedelta(days=2))
        self._guest("guest-new", joined=timezone.now() - timedelta(days=2))
        recent_card = self._guest("guest-card")
        create_box_recipe(recent_card, title="Fresh")

        self._run("--days", "30")

        remaining = set(User.objects.values_list("username", flat=True))
        self.assertEqual(remaining, {"member", "guest-login", "guest-new", "guest-card"})

    def test_dry_run_deletes_nothing_and_prints_counts(self) -> None:
        idle = self._guest("guest-idle")
        _recipe, document = self._card_with_files(idle)

        output = self._run("--days", "30", "--dry-run")

        self.assertTrue(User.objects.filter(pk=idle.pk).exists())
        self.assertTrue(document.file.storage.exists(document.file.name))
        self.assertIn("1 guest", output)
        self.assertIn("2 file", output)
