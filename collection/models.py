import uuid

from django.conf import settings
from django.db import models

from catalog.base import StandardUnit, TimestampedModel


class CollectionRecipe(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="collection_recipes",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    equipment_notes = models.TextField(blank=True)
    prep_minutes = models.PositiveIntegerField(null=True, blank=True)
    cook_minutes = models.PositiveIntegerField(null=True, blank=True)
    hero_image = models.ImageField(upload_to="collection/", null=True, blank=True)
    source_document = models.ForeignKey(
        "library.SourceDocument",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="collection_recipes",
    )
    url_import = models.ForeignKey(
        "library.UrlRecipeImport",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="forked_collection_recipes",
    )
    fork_record = models.OneToOneField(
        "development.RecipeFork",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="collection_recipe",
    )

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class CollectionIngredientLine(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipe = models.ForeignKey(
        CollectionRecipe,
        on_delete=models.CASCADE,
        related_name="ingredient_lines",
    )
    ingredient = models.ForeignKey(
        "catalog.Ingredient",
        on_delete=models.PROTECT,
        related_name="collection_lines",
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit = models.CharField(max_length=32, choices=StandardUnit.choices, blank=True)
    custom_unit = models.CharField(max_length=64, blank=True)
    prep_note = models.CharField(max_length=255, blank=True)
    substitution_note = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "created_at"]


class RecipeBoxItem(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recipe_box_items",
    )
    recipe = models.OneToOneField(
        CollectionRecipe,
        on_delete=models.CASCADE,
        related_name="box_item",
    )

    class Meta:
        ordering = ["recipe__title"]
