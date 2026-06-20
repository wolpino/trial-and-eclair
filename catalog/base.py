from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class StandardUnit(models.TextChoices):
    TEASPOON = "teaspoon", "teaspoon"
    TABLESPOON = "tablespoon", "tablespoon"
    FLUID_OUNCE = "fluid_ounce", "fluid ounce"
    CUP = "cup", "cup"
    QUART = "quart", "quart"
    GALLON = "gallon", "gallon"
    MILLILITER = "milliliter", "milliliter"
    LITER = "liter", "liter"
    POUND = "pound", "pound"
    OUNCE = "ounce", "ounce"
    MILLIGRAM = "milligram", "milligram"
    GRAM = "gram", "gram"
    KILOGRAM = "kilogram", "kilogram"
    INCH = "inch", "inch"
    CENTIMETER = "centimeter", "centimeter"
    WHOLE = "whole", "whole"
