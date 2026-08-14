from dataclasses import dataclass, field
from decimal import Decimal

from django.db import transaction
from django.db.models import Max
from django.utils import timezone
from django.utils.text import slugify

from collection.models import CollectionIngredientLine, CollectionRecipe
from collection.services import create_box_recipe

from .models import (
    DevelopmentRecipe,
    ForkType,
    Idea,
    RecipeFork,
    RecipeStep,
    RecipeVersion,
    VersionIngredientLine,
)

_VERSION_SCALAR_FIELDS = (
    "title",
    "description",
    "version_notes",
    "equipment_notes",
    "prep_minutes",
    "cook_minutes",
    "story",
)

_LINE_COMPARE_FIELDS = (
    "quantity",
    "unit",
    "custom_unit",
    "prep_note",
    "substitution_note",
    "sort_order",
)


def _line_key(line: VersionIngredientLine) -> tuple:
    return (line.ingredient_id, line.sort_order)


def _serialize_ingredient_line(line: VersionIngredientLine) -> dict:
    return {
        "ingredient_id": str(line.ingredient_id),
        "ingredient_name": line.ingredient.name,
        "quantity": str(line.quantity),
        "unit": line.unit,
        "custom_unit": line.custom_unit,
        "prep_note": line.prep_note,
        "substitution_note": line.substitution_note,
        "sort_order": line.sort_order,
    }


def compare_versions(left: RecipeVersion, right: RecipeVersion) -> dict:
    if left.recipe_id != right.recipe_id:
        raise ValueError("Versions must belong to the same recipe.")

    field_changes = [
        {"field": field, "left": getattr(left, field), "right": getattr(right, field)}
        for field in _VERSION_SCALAR_FIELDS
        if getattr(left, field) != getattr(right, field)
    ]

    left_lines = list(
        left.ingredient_lines.select_related("ingredient").order_by("sort_order", "created_at")
    )
    right_lines = list(
        right.ingredient_lines.select_related("ingredient").order_by("sort_order", "created_at")
    )
    left_map = {_line_key(line): line for line in left_lines}
    right_map = {_line_key(line): line for line in right_lines}

    added = [_serialize_ingredient_line(right_map[key]) for key in sorted(set(right_map) - set(left_map))]
    removed = [_serialize_ingredient_line(left_map[key]) for key in sorted(set(left_map) - set(right_map))]

    changed = []
    for key in sorted(set(left_map) & set(right_map)):
        left_line = left_map[key]
        right_line = right_map[key]
        differing_fields = [
            field
            for field in _LINE_COMPARE_FIELDS
            if getattr(left_line, field) != getattr(right_line, field)
        ]
        if differing_fields:
            changed.append(
                {
                    "ingredient_name": left_line.ingredient.name,
                    "fields": differing_fields,
                    "left": _serialize_ingredient_line(left_line),
                    "right": _serialize_ingredient_line(right_line),
                }
            )

    return {
        "left_version": {
            "id": str(left.id),
            "version_number": left.version_number,
            "version_notes": left.version_notes,
        },
        "right_version": {
            "id": str(right.id),
            "version_number": right.version_number,
            "version_notes": right.version_notes,
        },
        "field_changes": field_changes,
        "ingredient_changes": {
            "added": added,
            "removed": removed,
            "changed": changed,
        },
    }


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

    for step in current.steps.all():
        RecipeStep.objects.create(
            version=new_version,
            order=step.order,
            body=step.body,
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


def _unique_cookbook_slug(title: str, *, exclude_cookbook_id=None) -> str:
    from .models import Cookbook

    base = slugify(title)[:240] or "cookbook"
    slug = base
    counter = 2
    queryset = Cookbook.objects.filter(slug=slug)
    if exclude_cookbook_id is not None:
        queryset = queryset.exclude(id=exclude_cookbook_id)
    while queryset.exists():
        suffix = f"-{counter}"
        slug = f"{base[: 255 - len(suffix)]}{suffix}"
        queryset = Cookbook.objects.filter(slug=slug)
        if exclude_cookbook_id is not None:
            queryset = queryset.exclude(id=exclude_cookbook_id)
        counter += 1
    return slug


@transaction.atomic
def add_cookbook_entry(
    cookbook,
    recipe: DevelopmentRecipe,
    *,
    version_id=None,
    sort_order: int = 0,
):
    from .models import CookbookRecipe

    if cookbook.user_id != recipe.user_id:
        raise ValueError("Recipe not found.")

    if version_id is not None:
        version = recipe.versions.filter(pk=version_id).first()
        if version is None:
            raise ValueError("Version not found for this recipe.")
    else:
        version = recipe.published_version or recipe.current_version

    if version is None:
        raise ValueError("No version available to snapshot.")

    return CookbookRecipe.objects.create(
        cookbook=cookbook,
        recipe=recipe,
        snapshot_version=version,
        sort_order=sort_order,
    )


@transaction.atomic
def publish_cookbook(cookbook, *, slug: str = ""):
    if slug:
        cookbook.slug = slugify(slug)[:255] or _unique_cookbook_slug(
            cookbook.title,
            exclude_cookbook_id=cookbook.id,
        )
    elif not cookbook.slug:
        cookbook.slug = _unique_cookbook_slug(
            cookbook.title,
            exclude_cookbook_id=cookbook.id,
        )

    cookbook.status = "published"
    cookbook.published_at = timezone.now()
    cookbook.save(
        update_fields=["slug", "status", "published_at", "updated_at"]
    )
    return cookbook


@transaction.atomic
def unpublish_cookbook(cookbook) -> None:
    cookbook.status = "unpublished"
    cookbook.save(update_fields=["status", "updated_at"])
    return cookbook


@transaction.atomic
def promote_idea(idea: Idea, *, title: str | None = None) -> DevelopmentRecipe:
    if idea.promoted_recipe_id is not None:
        raise ValueError("Idea already promoted to a recipe.")

    recipe_title = (title or idea.title).strip() or idea.title
    recipe = create_development_recipe(idea.user, title=recipe_title)
    idea.promoted_recipe = recipe
    idea.save(update_fields=["promoted_recipe", "updated_at"])
    return recipe


@dataclass
class IngredientLineCopy:
    name: str
    quantity: Decimal
    unit: str = ""
    custom_unit: str = ""
    prep_note: str = ""
    substitution_note: str = ""
    sort_order: int = 0
    ingredient: object | None = None


@dataclass
class RecipeCopyPayload:
    title: str
    description: str = ""
    equipment_notes: str = ""
    prep_minutes: int | None = None
    cook_minutes: int | None = None
    story: str = ""
    version_notes: str = ""
    ingredient_lines: list[IngredientLineCopy] = field(default_factory=list)
    step_bodies: list[str] = field(default_factory=list)


def payload_from_version(version: RecipeVersion) -> RecipeCopyPayload:
    lines = [
        IngredientLineCopy(
            name=line.ingredient.name,
            quantity=line.quantity,
            unit=line.unit,
            custom_unit=line.custom_unit,
            prep_note=line.prep_note,
            substitution_note=line.substitution_note,
            sort_order=line.sort_order,
            ingredient=line.ingredient,
        )
        for line in version.ingredient_lines.select_related("ingredient").order_by(
            "sort_order", "created_at"
        )
    ]
    step_bodies = list(version.steps.order_by("order").values_list("body", flat=True))
    return RecipeCopyPayload(
        title=version.title,
        description=version.description,
        equipment_notes=version.equipment_notes,
        prep_minutes=version.prep_minutes,
        cook_minutes=version.cook_minutes,
        story=version.story,
        version_notes=version.version_notes,
        ingredient_lines=lines,
        step_bodies=step_bodies,
    )


def _resolve_ingredient(line: IngredientLineCopy):
    from catalog.models import Ingredient

    if line.ingredient is not None:
        return line.ingredient
    name = (line.name or "ingredient").strip()[:255] or "ingredient"
    ingredient, _ = Ingredient.objects.get_or_create(name=name)
    return ingredient


def _copy_payload_steps(
    bodies: list[str],
    *,
    version: RecipeVersion | None = None,
    collection_recipe: CollectionRecipe | None = None,
) -> None:
    order = 1
    for body in bodies:
        text = (body or "").strip()
        if not text:
            continue
        RecipeStep.objects.create(
            version=version,
            collection_recipe=collection_recipe,
            order=order,
            body=text,
        )
        order += 1


def _copy_payload_lines_to_box(
    recipe: CollectionRecipe,
    lines: list[IngredientLineCopy],
) -> None:
    for sort_order, line in enumerate(lines):
        CollectionIngredientLine.objects.create(
            recipe=recipe,
            ingredient=_resolve_ingredient(line),
            quantity=line.quantity,
            unit=line.unit,
            custom_unit=line.custom_unit,
            prep_note=line.prep_note,
            substitution_note=line.substitution_note,
            sort_order=line.sort_order if line.sort_order else sort_order,
        )


def _copy_payload_lines_to_version(
    version: RecipeVersion,
    lines: list[IngredientLineCopy],
) -> None:
    for sort_order, line in enumerate(lines):
        VersionIngredientLine.objects.create(
            version=version,
            ingredient=_resolve_ingredient(line),
            quantity=line.quantity,
            unit=line.unit,
            custom_unit=line.custom_unit,
            prep_note=line.prep_note,
            substitution_note=line.substitution_note,
            sort_order=line.sort_order if line.sort_order else sort_order,
        )


@transaction.atomic
def copy_payload_to_box(user, payload: RecipeCopyPayload, **extra_fields) -> CollectionRecipe:
    recipe = create_box_recipe(
        user,
        title=payload.title,
        description=payload.description,
        equipment_notes=payload.equipment_notes,
        prep_minutes=payload.prep_minutes,
        cook_minutes=payload.cook_minutes,
        **extra_fields,
    )
    _copy_payload_lines_to_box(recipe, payload.ingredient_lines)
    _copy_payload_steps(payload.step_bodies, collection_recipe=recipe)
    return recipe


@transaction.atomic
def copy_payload_to_lab(
    user,
    payload: RecipeCopyPayload,
    *,
    title: str | None = None,
) -> DevelopmentRecipe:
    recipe_title = (title or payload.title).strip() or payload.title
    recipe = create_development_recipe(user, title=recipe_title)
    current = recipe.current_version
    if current is None:
        raise ValueError("Recipe has no current version.")
    current.title = recipe_title
    current.description = payload.description
    current.equipment_notes = payload.equipment_notes
    current.prep_minutes = payload.prep_minutes
    current.cook_minutes = payload.cook_minutes
    current.story = payload.story
    current.version_notes = payload.version_notes
    current.save()
    _copy_payload_lines_to_version(current, payload.ingredient_lines)
    _copy_payload_steps(payload.step_bodies, version=current)
    return recipe


@transaction.atomic
def fork_to_box(user, version: RecipeVersion, source_user) -> CollectionRecipe:
    fork = RecipeFork.objects.create(
        user=user,
        forked_from_version=version,
        forked_from_user=source_user,
        fork_type=ForkType.SAVE_TO_BOX,
    )
    return copy_payload_to_box(user, payload_from_version(version), fork_record=fork)


@transaction.atomic
def fork_to_lab(
    user,
    version: RecipeVersion,
    source_user,
    *,
    title: str | None = None,
    story: str | None = None,
) -> DevelopmentRecipe:
    payload = payload_from_version(version)
    if story is not None:
        payload.story = story
    fork = RecipeFork.objects.create(
        user=user,
        forked_from_version=version,
        forked_from_user=source_user,
        fork_type=ForkType.REWORK,
    )
    recipe = copy_payload_to_lab(user, payload, title=title)
    recipe.fork_record = fork
    recipe.save(update_fields=["fork_record", "updated_at"])
    return recipe
