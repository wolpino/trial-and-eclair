from django.contrib import admin

from .models import CollectionIngredientLine, CollectionRecipe, RecipeBoxItem


class CollectionIngredientLineInline(admin.TabularInline):
    model = CollectionIngredientLine
    extra = 0


@admin.register(CollectionRecipe)
class CollectionRecipeAdmin(admin.ModelAdmin):
    list_display = ["title", "user"]
    search_fields = ["title"]
    inlines = [CollectionIngredientLineInline]


@admin.register(RecipeBoxItem)
class RecipeBoxItemAdmin(admin.ModelAdmin):
    list_display = ["user", "recipe"]
