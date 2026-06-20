from django.contrib import admin

from .models import (
    Cookbook,
    CookbookRecipe,
    DevelopmentRecipe,
    Idea,
    JournalEntry,
    RecipeFork,
    RecipeStep,
    RecipeVersion,
    TestSession,
    TestSessionPhoto,
    VersionIngredientLine,
)


class VersionIngredientLineInline(admin.TabularInline):
    model = VersionIngredientLine
    extra = 0


class RecipeStepInline(admin.TabularInline):
    model = RecipeStep
    extra = 0
    fk_name = "version"


class TestSessionPhotoInline(admin.TabularInline):
    model = TestSessionPhoto
    extra = 0


@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "status", "category_tag", "is_pinned"]
    list_filter = ["status", "category_tag"]
    search_fields = ["title", "notes"]


@admin.register(DevelopmentRecipe)
class DevelopmentRecipeAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "status", "slug"]
    search_fields = ["title", "slug"]


@admin.register(RecipeVersion)
class RecipeVersionAdmin(admin.ModelAdmin):
    list_display = ["title", "recipe", "version_number"]
    inlines = [VersionIngredientLineInline, RecipeStepInline]


@admin.register(TestSession)
class TestSessionAdmin(admin.ModelAdmin):
    inlines = [TestSessionPhotoInline]


admin.site.register(JournalEntry)
admin.site.register(Cookbook)
admin.site.register(CookbookRecipe)
admin.site.register(RecipeFork)
