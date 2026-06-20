from django.contrib import admin

from .models import Ingredient, IngredientAlias


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    search_fields = ["name"]
    list_display = ["name", "default_unit", "base_ingredient"]


@admin.register(IngredientAlias)
class IngredientAliasAdmin(admin.ModelAdmin):
    list_display = ["alias_name", "ingredient", "user"]
    search_fields = ["alias_name", "ingredient__name"]
