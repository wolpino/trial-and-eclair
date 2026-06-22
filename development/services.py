from django.db import transaction
from django.db.models import Max

from .models import DevelopmentRecipe, RecipeVersion, VersionIngredientLine

_VERSION_SCALAR_FIELDS = (
    "title",
    "description",
    "version_notes",
    "equipment_notes",
    "prep_minutes",
    "cook_minutes",
    "story",
)

_LINE_COPY_FIELDS = (
    "ingredient",
    "quantity",
    "unit",
    "custom_unit",
    "prep_note",
    "substitution_note",
    "sort_order",
)


@transaction.atomic
def create_development_recipe(user, *, title: str) -> DevelopmentRecipe:
    recipe = DevelopmentRecipe.objects.create(user=user, title=title)
    version = RecipeVersion.objects.create(
        recipe=recipe,
        version_number=1,
        title=title,
    )
    recipe.current_version = version
    recipe.save(update_fields=["current_version", "updated_at"])
    return recipe


def _copy_version_fields(source: RecipeVersion, target: RecipeVersion) -> None:
    for field in _VERSION_SCALAR_FIELDS:
        setattr(target, field, getattr(source, field))
    target.hero_image = source.hero_image


@transaction.atomic
def save_new_version(
    recipe: DevelopmentRecipe,
    *,
    version_notes: str = "",
) -> RecipeVersion:
    current = recipe.current_version
    if current is None:
        raise ValueError("Recipe has no current version.")

    max_version = recipe.versions.aggregate(max_number=Max("version_number"))[
        "max_number"
    ]
    new_version = RecipeVersion(
        recipe=recipe,
        version_number=max_version + 1,
    )
    _copy_version_fields(current, new_version)
    if version_notes:
        new_version.version_notes = version_notes
    new_version.save()

    for line in current.ingredient_lines.all():
        VersionIngredientLine.objects.create(
            version=new_version,
            **{field: getattr(line, field) for field in _LINE_COPY_FIELDS},
        )

    recipe.current_version = new_version
    recipe.save(update_fields=["current_version", "updated_at"])
    return new_version
