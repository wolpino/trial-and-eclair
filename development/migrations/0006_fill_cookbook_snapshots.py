from django.db import migrations


def _snapshot(version) -> dict:
    # Same keys as services.cookbook_snapshot, built from historical models.
    lines = version.ingredient_lines.select_related("ingredient").order_by(
        "sort_order", "created_at"
    )
    return {
        "version_number": version.version_number,
        "title": version.title,
        "description": version.description,
        "equipment_notes": version.equipment_notes,
        "prep_minutes": version.prep_minutes,
        "cook_minutes": version.cook_minutes,
        "story": version.story,
        "hero_image": version.hero_image.name or "",
        "ingredient_lines": [
            {
                "ingredient_name": line.ingredient.name,
                "quantity": str(line.quantity),
                "unit": line.unit,
                "custom_unit": line.custom_unit,
                "prep_note": line.prep_note,
                "substitution_note": line.substitution_note,
            }
            for line in lines
        ],
        "steps": list(version.steps.order_by("order").values_list("body", flat=True)),
    }


def fill_snapshots(apps, schema_editor) -> None:
    """Copy each FK-pinned entry's version into ``snapshot``. Safe to run twice."""
    CookbookRecipe = apps.get_model("development", "CookbookRecipe")
    entries = CookbookRecipe.objects.filter(snapshot_version__isnull=False).select_related(
        "snapshot_version"
    )
    for entry in entries.iterator():
        if entry.snapshot:
            continue
        entry.snapshot = _snapshot(entry.snapshot_version)
        entry.save(update_fields=["snapshot"])


def relink_versions(apps, schema_editor) -> None:
    """Reverse: point entries back at their Lab version by number.

    Entries whose Lab recipe or version is gone stay unlinked, so reversing
    0005 after that fails on its NOT NULL columns. The copies are kept.
    """
    CookbookRecipe = apps.get_model("development", "CookbookRecipe")
    RecipeVersion = apps.get_model("development", "RecipeVersion")
    entries = CookbookRecipe.objects.filter(snapshot_version__isnull=True, recipe__isnull=False)
    for entry in entries.iterator():
        version = RecipeVersion.objects.filter(
            recipe_id=entry.recipe_id,
            version_number=entry.snapshot.get("version_number"),
        ).first()
        if version is not None:
            entry.snapshot_version = version
            entry.save(update_fields=["snapshot_version"])


class Migration(migrations.Migration):
    dependencies = [
        ("development", "0005_cookbook_entry_snapshot"),
    ]

    operations = [
        migrations.RunPython(fill_snapshots, relink_versions),
    ]
