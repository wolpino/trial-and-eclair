from rest_framework import serializers

from .models import (
    Cookbook,
    CookbookRecipe,
    DevelopmentRecipe,
    Idea,
    JournalEntry,
    RecipeVersion,
    VersionIngredientLine,
)


class IdeaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = (
            "id",
            "title",
            "notes",
            "category_tag",
            "status",
            "is_pinned",
            "image",
            "promoted_recipe",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "promoted_recipe", "created_at", "updated_at")


class VersionIngredientLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = VersionIngredientLine
        fields = (
            "id",
            "ingredient",
            "quantity",
            "unit",
            "custom_unit",
            "prep_note",
            "substitution_note",
            "sort_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs: dict) -> dict:
        unit = attrs.get("unit", getattr(self.instance, "unit", ""))
        custom_unit = attrs.get(
            "custom_unit",
            getattr(self.instance, "custom_unit", ""),
        )
        if unit and custom_unit:
            raise serializers.ValidationError(
                "Use either unit or custom_unit, not both."
            )
        return attrs


class RecipeVersionSerializer(serializers.ModelSerializer):
    ingredient_lines = VersionIngredientLineSerializer(many=True, read_only=True)

    class Meta:
        model = RecipeVersion
        fields = (
            "id",
            "version_number",
            "title",
            "description",
            "version_notes",
            "equipment_notes",
            "prep_minutes",
            "cook_minutes",
            "hero_image",
            "story",
            "ingredient_lines",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "version_number", "created_at", "updated_at")


class DevelopmentRecipeSerializer(serializers.ModelSerializer):
    current_version = RecipeVersionSerializer(read_only=True)
    published_version = RecipeVersionSerializer(read_only=True)

    class Meta:
        model = DevelopmentRecipe
        fields = (
            "id",
            "title",
            "slug",
            "status",
            "current_version",
            "published_version",
            "published_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "slug",
            "current_version",
            "published_version",
            "published_at",
            "created_at",
            "updated_at",
        )


class DevelopmentRecipeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DevelopmentRecipe
        fields = ("title",)


class SaveNewVersionSerializer(serializers.Serializer):
    version_notes = serializers.CharField(required=False, allow_blank=True, default="")


class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = (
            "id",
            "recipe",
            "version_snapshot",
            "title",
            "body",
            "logged_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "logged_at", "created_at", "updated_at")

    def validate_recipe(self, recipe: DevelopmentRecipe) -> DevelopmentRecipe:
        user = self.context["request"].user
        if recipe.user_id != user.id:
            raise serializers.ValidationError("Recipe not found.")
        return recipe

    def validate(self, attrs: dict) -> dict:
        recipe = attrs.get("recipe") or getattr(self.instance, "recipe", None)
        version = attrs.get(
            "version_snapshot",
            getattr(self.instance, "version_snapshot", None),
        )
        if version is not None and recipe is not None and version.recipe_id != recipe.id:
            raise serializers.ValidationError(
                {"version_snapshot": "Version must belong to the selected recipe."}
            )
        return attrs


class PublishRecipeSerializer(serializers.Serializer):
    version_id = serializers.UUIDField(required=False)
    slug = serializers.SlugField(required=False, allow_blank=True, max_length=255)
    story = serializers.CharField(required=False, allow_blank=True)
    hero_image = serializers.ImageField(required=False)


class PublishCookbookSerializer(serializers.Serializer):
    slug = serializers.SlugField(required=False, allow_blank=True, max_length=255)


class CookbookRecipeSerializer(serializers.ModelSerializer):
    snapshot_version = RecipeVersionSerializer(read_only=True)

    class Meta:
        model = CookbookRecipe
        fields = (
            "id",
            "recipe",
            "snapshot_version",
            "sort_order",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "snapshot_version", "created_at", "updated_at")

    def validate_recipe(self, recipe: DevelopmentRecipe) -> DevelopmentRecipe:
        user = self.context["request"].user
        if recipe.user_id != user.id:
            raise serializers.ValidationError("Recipe not found.")
        return recipe


class CookbookRecipeCreateSerializer(serializers.Serializer):
    recipe = serializers.UUIDField()
    version_id = serializers.UUIDField(required=False)
    sort_order = serializers.IntegerField(required=False, min_value=0, default=0)


class CookbookSerializer(serializers.ModelSerializer):
    entries = CookbookRecipeSerializer(many=True, read_only=True)

    class Meta:
        model = Cookbook
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "status",
            "published_at",
            "entries",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "slug",
            "status",
            "published_at",
            "entries",
            "created_at",
            "updated_at",
        )


class CookbookCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cookbook
        fields = ("title", "description")


class PublicCookbookEntrySerializer(serializers.Serializer):
    title = serializers.CharField()
    description = serializers.CharField()
    sort_order = serializers.IntegerField()
    recipe_slug = serializers.CharField(allow_null=True)


class PublicCookbookSerializer(serializers.Serializer):
    slug = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    author = serializers.CharField()
    published_at = serializers.DateTimeField()
    recipes = PublicCookbookEntrySerializer(many=True)


class PublicRecipeStepSerializer(serializers.Serializer):
    order = serializers.IntegerField()
    body = serializers.CharField()


class PublicIngredientLineSerializer(serializers.Serializer):
    ingredient_name = serializers.CharField(source="ingredient.name")
    quantity = serializers.DecimalField(max_digits=10, decimal_places=3)
    unit = serializers.CharField()
    custom_unit = serializers.CharField()
    prep_note = serializers.CharField()
    substitution_note = serializers.CharField()
    sort_order = serializers.IntegerField()


class PublicForkLineageSerializer(serializers.Serializer):
    title = serializers.CharField()
    author = serializers.CharField()
    slug = serializers.CharField(allow_null=True)


class PublicRecipeSerializer(serializers.Serializer):
    slug = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    story = serializers.CharField()
    hero_image = serializers.ImageField()
    equipment_notes = serializers.CharField()
    prep_minutes = serializers.IntegerField(allow_null=True)
    cook_minutes = serializers.IntegerField(allow_null=True)
    author = serializers.CharField()
    published_at = serializers.DateTimeField()
    ingredient_lines = PublicIngredientLineSerializer(many=True)
    steps = PublicRecipeStepSerializer(many=True)
    fork_lineage = PublicForkLineageSerializer(allow_null=True)
