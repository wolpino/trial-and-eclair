import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from catalog.base import StandardUnit, TimestampedModel


class IdeaStatus(models.TextChoices):
    RESEARCHING = "researching", "Researching"
    TESTING = "testing", "Testing"
    READY = "ready", "Ready to publish"
    ARCHIVED = "archived", "Archived"


# Sample rows (seed/data/sample_kitchen.json) have no owner and are read-only.
SAMPLE_OWNER_CHECK = models.Q(is_sample=True, user__isnull=True) | models.Q(
    is_sample=False, user__isnull=False
)


class Idea(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="ideas",
    )
    is_sample = models.BooleanField(default=False)
    title = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    category_tag = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20,
        choices=IdeaStatus.choices,
        default=IdeaStatus.RESEARCHING,
    )
    is_pinned = models.BooleanField(default=True)
    image = models.ImageField(upload_to="ideas/", null=True, blank=True)
    promoted_recipe = models.OneToOneField(
        "DevelopmentRecipe",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="source_idea",
    )

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.CheckConstraint(condition=SAMPLE_OWNER_CHECK, name="idea_sample_has_no_owner"),
        ]

    def __str__(self):
        return self.title


class DevelopmentRecipe(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="development_recipes",
    )
    is_sample = models.BooleanField(default=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("draft", "Draft"),
            ("published", "Published"),
            ("unpublished", "Unpublished"),
        ],
        default="draft",
    )
    current_version = models.ForeignKey(
        "RecipeVersion",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    published_version = models.ForeignKey(
        "RecipeVersion",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    published_at = models.DateTimeField(null=True, blank=True)
    fork_record = models.OneToOneField(
        "RecipeFork",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="development_recipe",
    )

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.CheckConstraint(
                condition=SAMPLE_OWNER_CHECK, name="development_recipe_sample_has_no_owner"
            ),
        ]

    def __str__(self):
        return self.title


class RecipeVersion(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipe = models.ForeignKey(
        DevelopmentRecipe,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    version_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    version_notes = models.TextField(blank=True)
    equipment_notes = models.TextField(blank=True)
    prep_minutes = models.PositiveIntegerField(null=True, blank=True)
    cook_minutes = models.PositiveIntegerField(null=True, blank=True)
    hero_image = models.ImageField(upload_to="recipes/", null=True, blank=True)
    story = models.TextField(blank=True)

    class Meta:
        ordering = ["recipe", "version_number"]
        unique_together = [("recipe", "version_number")]

    def __str__(self):
        return f"{self.recipe.title} v{self.version_number}"


class VersionIngredientLine(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    version = models.ForeignKey(
        RecipeVersion,
        on_delete=models.CASCADE,
        related_name="ingredient_lines",
    )
    ingredient = models.ForeignKey(
        "catalog.Ingredient",
        on_delete=models.PROTECT,
        related_name="version_lines",
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=32, choices=StandardUnit.choices, blank=True)
    custom_unit = models.CharField(max_length=64, blank=True)
    prep_note = models.CharField(max_length=255, blank=True)
    substitution_note = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "created_at"]

    def clean(self):
        if self.unit and self.custom_unit:
            raise ValidationError("Use either unit or custom_unit, not both.")

    def display_unit(self):
        return self.custom_unit or self.get_unit_display() or self.unit


class RecipeStep(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    version = models.ForeignKey(
        RecipeVersion,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="steps",
    )
    collection_recipe = models.ForeignKey(
        "collection.CollectionRecipe",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="steps",
    )
    order = models.PositiveIntegerField()
    body = models.TextField()

    class Meta:
        ordering = ["order"]

    def clean(self):
        if bool(self.version) == bool(self.collection_recipe):
            raise ValidationError("Step must belong to exactly one recipe target.")


class TestSession(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    version = models.ForeignKey(
        RecipeVersion,
        on_delete=models.CASCADE,
        related_name="test_sessions",
    )
    notes = models.TextField(blank=True)
    outcome = models.TextField(blank=True)
    tested_at = models.DateTimeField(auto_now_add=True)

    class TempUnit(models.TextChoices):
        FAHRENHEIT = "F", "°F"
        CELSIUS = "C", "°C"

    # Stored as typed; no conversion between units.
    oven_temp = models.PositiveSmallIntegerField(null=True, blank=True)
    oven_temp_unit = models.CharField(
        max_length=1,
        choices=TempUnit.choices,
        null=True,
        blank=True,
    )
    bake_minutes = models.PositiveSmallIntegerField(null=True, blank=True)
    rating = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )

    class Meta:
        ordering = ["-tested_at"]


class TestSessionPhoto(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        TestSession,
        on_delete=models.CASCADE,
        related_name="photos",
    )
    image = models.ImageField(upload_to="test_sessions/")
    caption = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["created_at"]


class JournalEntry(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="journal_entries",
    )
    recipe = models.ForeignKey(
        DevelopmentRecipe,
        on_delete=models.CASCADE,
        related_name="journal_entries",
    )
    version_snapshot = models.ForeignKey(
        RecipeVersion,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="journal_snapshots",
    )
    title = models.CharField(max_length=255, blank=True)
    body = models.TextField()
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-logged_at"]


class Cookbook(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cookbooks",
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("draft", "Draft"),
            ("published", "Published"),
            ("unpublished", "Unpublished"),
        ],
        default="draft",
    )
    published_at = models.DateTimeField(null=True, blank=True)
    on_shelf = models.BooleanField(default=False)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class CookbookRecipe(TimestampedModel):
    """A copy of a recipe, owned by the cookbook. Lab edits and deletes never change it."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cookbook = models.ForeignKey(
        Cookbook,
        on_delete=models.CASCADE,
        related_name="entries",
    )
    # Link back to the Lab recipe for the developer's manager; null once it is deleted.
    recipe = models.ForeignKey(
        DevelopmentRecipe,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="cookbook_entries",
    )
    # Built by services.cookbook_snapshot from model fields at add time.
    snapshot = models.JSONField(default=dict)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = [("cookbook", "recipe")]
        ordering = ["sort_order"]


class ForkType(models.TextChoices):
    SAVE_TO_BOX = "save_to_box", "Save to box"
    REWORK = "rework", "Rework"


class RecipeFork(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recipe_forks",
    )
    # Null once the original recipe or its author is deleted; the fork's
    # content is already a copy, so it outlives both.
    forked_from_version = models.ForeignKey(
        RecipeVersion,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="forks",
    )
    forked_from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="forked_recipes",
    )
    fork_type = models.CharField(max_length=20, choices=ForkType.choices)

    class Meta:
        ordering = ["-created_at"]
