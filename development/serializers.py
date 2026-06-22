from rest_framework import serializers

from .models import DevelopmentRecipe, Idea, RecipeVersion, VersionIngredientLine


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
