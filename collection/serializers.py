from rest_framework import serializers

from development.models import RecipeStep

from .models import CollectionIngredientLine, CollectionRecipe


class CollectionRecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ("id", "order", "body", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class CollectionIngredientLineSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source="ingredient.name", read_only=True)

    class Meta:
        model = CollectionIngredientLine
        fields = (
            "id",
            "ingredient",
            "ingredient_name",
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
        fields = ("title", "description", "equipment_notes", "prep_minutes", "cook_minutes")
