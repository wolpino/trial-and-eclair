from rest_framework import serializers

from development.models import RecipeStep

from .models import CollectionIngredientLine, CollectionRecipe


class CollectionRecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ("id", "order", "body", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class CollectionIngredientLineSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.SerializerMethodField()

    class Meta:
        model = CollectionIngredientLine
        fields = (
            "id",
            "ingredient",
            "ingredient_name",
            "raw_text",
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

    def get_ingredient_name(self, obj) -> str | None:
        return obj.ingredient.name if obj.ingredient_id else None

    def validate(self, attrs: dict) -> dict:
        ingredient = attrs.get("ingredient", getattr(self.instance, "ingredient", None))
        raw_text = attrs.get("raw_text", getattr(self.instance, "raw_text", ""))
        if ingredient is None and not (raw_text or "").strip():
            raise serializers.ValidationError(
                "A line needs raw_text or an ingredient."
            )
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


class CollectionRecipeSerializer(serializers.ModelSerializer):
    ingredient_lines = CollectionIngredientLineSerializer(many=True, read_only=True)
    steps = CollectionRecipeStepSerializer(many=True, read_only=True)

    class Meta:
        model = CollectionRecipe
        fields = (
            "id",
            "title",
            "description",
            "equipment_notes",
            "prep_minutes",
            "cook_minutes",
            "servings",
            "source_type",
            "hero_image",
            "ingredient_lines",
            "steps",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class CollectionRecipeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionRecipe
        fields = (
            "title",
            "description",
            "equipment_notes",
            "prep_minutes",
            "cook_minutes",
            "servings",
            "source_type",
        )
