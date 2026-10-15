from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from accounts.models import User
from collection.models import CollectionRecipe
from library.models import SourceDocument


class Command(BaseCommand):
    help = (
        "Delete guest accounts with no card change, login or sign-up in --days days, "
        "along with their cards and uploaded files."
    )

    def add_arguments(self, parser) -> None:
        parser.add_argument("--days", type=int, default=30)
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, days: int, dry_run: bool, **options) -> None:
        cutoff = timezone.now() - timedelta(days=days)
        guest_ids = list(
            User.objects.filter(is_guest=True, date_joined__lt=cutoff)
            .exclude(last_login__gte=cutoff)
            .exclude(
                Q(collection_recipes__updated_at__gte=cutoff)
                | Q(recipe_box_items__updated_at__gte=cutoff)
            )
            .values_list("pk", flat=True)
            .distinct()
        )
        files = _uploaded_files(guest_ids)
        if not dry_run:
            # Django does not delete files when rows cascade, so remove them explicitly.
            User.objects.filter(pk__in=guest_ids).delete()
            for storage, name in files:
                storage.delete(name)
        verb = "Would delete" if dry_run else "Deleted"
        self.stdout.write(f"{verb} {len(guest_ids)} guest(s) and {len(files)} file(s).")


def _uploaded_files(user_ids: list) -> list[tuple]:
    files = [
        (document.file.storage, document.file.name)
        for document in SourceDocument.objects.filter(user_id__in=user_ids).exclude(file="")
    ]
    recipes = CollectionRecipe.objects.filter(user_id__in=user_ids).exclude(hero_image="")
    files += [
        (recipe.hero_image.storage, recipe.hero_image.name)
        for recipe in recipes.exclude(hero_image__isnull=True)
    ]
    return files
