from django.db import transaction
from django.db.models import Max
from django.utils import timezone
from django.utils.text import slugify

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


def _unique_recipe_slug(title: str, *, exclude_recipe_id=None) -> str:
    base = slugify(title)[:240] or "recipe"
    slug = base
    counter = 2
    queryset = DevelopmentRecipe.objects.filter(slug=slug)
    if exclude_recipe_id is not None:
        queryset = queryset.exclude(id=exclude_recipe_id)
    while queryset.exists():
        suffix = f"-{counter}"
        slug = f"{base[: 255 - len(suffix)]}{suffix}"
        queryset = DevelopmentRecipe.objects.filter(slug=slug)
        if exclude_recipe_id is not None:
            queryset = queryset.exclude(id=exclude_recipe_id)
        counter += 1
    return slug


@transaction.atomic
def publish_recipe(
    recipe: DevelopmentRecipe,
    *,
    version_id=None,
    slug: str = "",
    story: str | None = None,
    hero_image=None,
) -> DevelopmentRecipe:
    if version_id is not None:
        version = recipe.versions.filter(pk=version_id).first()
        if version is None:
            raise ValueError("Version not found for this recipe.")
    else:
        version = recipe.current_version

    if version is None:
        raise ValueError("Recipe has no version to publish.")

    update_fields: list[str] = []
    if story is not None:
        version.story = story
        update_fields.append("story")
    if hero_image is not None:
        version.hero_image = hero_image
        update_fields.append("hero_image")
    if update_fields:
        update_fields.append("updated_at")
        version.save(update_fields=update_fields)

    if slug:
        recipe.slug = slugify(slug)[:255] or _unique_recipe_slug(
            version.title,
            exclude_recipe_id=recipe.id,
        )
    elif not recipe.slug:
        recipe.slug = _unique_recipe_slug(version.title, exclude_recipe_id=recipe.id)

    recipe.published_version = version
    recipe.published_at = timezone.now()
    recipe.status = "published"
    recipe.save(
        update_fields=["slug", "published_version", "published_at", "status", "updated_at"]
    )
    return recipe


@transaction.atomic
def unpublish_recipe(recipe: DevelopmentRecipe) -> DevelopmentRecipe:
    recipe.status = "unpublished"
    recipe.save(update_fields=["status", "updated_at"])
    return recipe
