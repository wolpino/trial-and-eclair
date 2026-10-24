import json
from decimal import Decimal
from pathlib import Path
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import Ingredient
from development.models import (
    DevelopmentRecipe,
    Idea,
    RecipeStep,
    RecipeVersion,
    TestSession,
    VersionIngredientLine,
)

SAMPLE_FILE = Path(settings.BASE_DIR) / "seed" / "data" / "sample_kitchen.json"


class Command(BaseCommand):
    help = (
        "Load the read-only sample cork board and Lab notebook from "
        "seed/data/sample_kitchen.json. Content only (no users or passwords), "
        "so it is safe on public URLs."
    )

    @transaction.atomic
    def handle(self, *args: object, **options: Any) -> None:
        data = json.loads(SAMPLE_FILE.read_text())

        recipes: dict[str, DevelopmentRecipe] = {}
        for item in data.get("recipes", []):
            recipes[item["title"]] = self._load_recipe(item)
        DevelopmentRecipe.objects.filter(is_sample=True).exclude(title__in=recipes).delete()

        titles = []
        for item in data.get("ideas", []):
            titles.append(item["title"])
            Idea.objects.update_or_create(
                is_sample=True,
                title=item["title"],
                defaults={
                    "notes": item.get("notes", ""),
                    "category_tag": item.get("category_tag", ""),
                    "status": item.get("status", "researching"),
                    "is_pinned": True,
                    "promoted_recipe": recipes.get(item.get("recipe", "")),
                },
            )
        Idea.objects.filter(is_sample=True).exclude(title__in=titles).delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Loaded {len(titles)} sample ideas and {len(recipes)} sample Lab recipes."
            )
        )

    def _load_recipe(self, item: dict[str, Any]) -> DevelopmentRecipe:
        recipe, _ = DevelopmentRecipe.objects.get_or_create(
            is_sample=True, title=item["title"], defaults={"status": "draft"}
        )
        versions = item.get("versions", [])
        current = None
        for number, row in enumerate(versions, start=1):
            current, _ = RecipeVersion.objects.update_or_create(
                recipe=recipe,
                version_number=number,
                defaults={
                    "title": row.get("title", item["title"]),
                    "description": row.get("description", ""),
                    "version_notes": row.get("version_notes", ""),
                    "equipment_notes": row.get("equipment_notes", ""),
                    "prep_minutes": row.get("prep_minutes"),
                    "cook_minutes": row.get("cook_minutes"),
                },
            )
            # Children are rebuilt from the file on every run.
            current.ingredient_lines.all().delete()
            current.steps.all().delete()
            current.test_sessions.all().delete()
            for order, line in enumerate(row.get("ingredients", [])):
                ingredient, _ = Ingredient.objects.get_or_create(name=line["name"])
                VersionIngredientLine.objects.create(
                    version=current,
                    ingredient=ingredient,
                    quantity=Decimal(line["quantity"]),
                    unit=line.get("unit", ""),
                    custom_unit=line.get("custom_unit", ""),
                    prep_note=line.get("prep_note", ""),
                    sort_order=order,
                )
            for order, body in enumerate(row.get("steps", []), start=1):
                RecipeStep.objects.create(version=current, order=order, body=body)
            for session in row.get("test_sessions", []):
                TestSession.objects.create(
                    version=current,
                    notes=session.get("notes", ""),
                    outcome=session.get("outcome", ""),
                    oven_temp=session.get("oven_temp"),
                    oven_temp_unit=session.get("oven_temp_unit"),
                    bake_minutes=session.get("bake_minutes"),
                    rating=session.get("rating"),
                )
        recipe.versions.filter(version_number__gt=len(versions)).delete()
        recipe.current_version = current
        recipe.save(update_fields=["current_version", "updated_at"])
        return recipe
