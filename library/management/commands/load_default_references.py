import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from library.models import Reference

DEFAULTS_FILE = Path(settings.BASE_DIR) / "seed" / "data" / "default_references.json"


class Command(BaseCommand):
    help = (
        "Load the shared default references from seed/data/default_references.json. "
        "Shelf content only (no users or passwords), so it is safe on public URLs."
    )

    @transaction.atomic
    def handle(self, *args, **options) -> None:
        items = json.loads(DEFAULTS_FILE.read_text())
        urls = []
        for item in items:
            urls.append(item["url"])
            Reference.objects.update_or_create(
                user=None,
                url=item["url"],
                defaults={"title": item["title"], "ref_type": item["ref_type"]},
            )
        # Defaults dropped from the file leave every shelf.
        Reference.objects.filter(user=None).exclude(url__in=urls).delete()
        self.stdout.write(self.style.SUCCESS(f"Loaded {len(urls)} default references."))
