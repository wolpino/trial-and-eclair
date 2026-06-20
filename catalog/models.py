import uuid

from django.conf import settings
from django.db import models

from catalog.base import StandardUnit, TimestampedModel


class Ingredient(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    base_ingredient = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="variants",
    )
    default_unit = models.CharField(
        max_length=32,
        choices=StandardUnit.choices,
        blank=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class IngredientAlias(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ingredient_aliases",
    )
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name="aliases",
    )
    alias_name = models.CharField(max_length=255)
    default_substitution_note = models.TextField(blank=True)

    class Meta:
        unique_together = [("user", "alias_name")]
        ordering = ["alias_name"]

    def __str__(self):
        return self.alias_name
