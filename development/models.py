import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from catalog.base import StandardUnit, TimestampedModel


class IdeaStatus(models.TextChoices):
    RESEARCHING = "researching", "Researching"
    TESTING = "testing", "Testing"
    READY = "ready", "Ready to publish"
    ARCHIVED = "archived", "Archived"


class Idea(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ideas",
    )
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

    def __str__(self):
        return self.title


class DevelopmentRecipe(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="development_recipes",
    )
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

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class CookbookRecipe(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cookbook = models.ForeignKey(
        Cookbook,
        on_delete=models.CASCADE,
        related_name="entries",
    )
    recipe = models.ForeignKey(
        DevelopmentRecipe,
        on_delete=models.CASCADE,
        related_name="cookbook_entries",
    )
    snapshot_version = models.ForeignKey(
        RecipeVersion,
        on_delete=models.PROTECT,
        related_name="cookbook_snapshots",
    )
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
    forked_from_version = models.ForeignKey(
        RecipeVersion,
        on_delete=models.PROTECT,
        related_name="forks",
    )
    forked_from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="forked_recipes",
    )
    fork_type = models.CharField(max_length=20, choices=ForkType.choices)

    class Meta:
        ordering = ["-created_at"]
