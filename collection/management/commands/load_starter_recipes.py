import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from collection.models import StarterRecipe

STARTER_FILE = Path(settings.BASE_DIR) / "seed" / "data" / "starter_recipes.json"


class Command(BaseCommand):
    help = (
        "Load the shared starter cards from seed/data/starter_recipes.json. "
        "Recipe content only (no users or passwords), so it is safe on public URLs."
    )

    @transaction.atomic
    def handle(self, *args, **options) -> None:
        recipes = json.loads(STARTER_FILE.read_text())
        titles = []
        for sort_order, item in enumerate(recipes):
            titles.append(item["title"])
            StarterRecipe.objects.update_or_create(
                title=item["title"],
                defaults={
                    "servings": item.get("servings"),
                    "prep_minutes": item.get("prep_minutes"),
                    "cook_minutes": item.get("cook_minutes"),
                    "source_type": item.get("source_type", "typed"),
                    "ingredient_lines": item.get("ingredient_lines", []),
                    "steps": item.get("steps", []),
                    "sort_order": sort_order,
                    "is_active": True,
                },
            )
        # Starters dropped from the file stop showing; hidden records stay valid.
        retired = StarterRecipe.objects.exclude(title__in=titles).update(is_active=False)
        self.stdout.write(
            self.style.SUCCESS(f"Loaded {len(titles)} starter recipes ({retired} retired).")
        )
