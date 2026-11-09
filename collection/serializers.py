from rest_framework import serializers

from development.models import RecipeStep

from .models import CollectionIngredientLine, CollectionRecipe, StarterRecipe


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


class StarterRecipeSerializer(serializers.ModelSerializer):
    """Same shape as a box card so the client can merge the two lists."""

    description = serializers.SerializerMethodField()
    equipment_notes = serializers.SerializerMethodField()
    hero_image = serializers.SerializerMethodField()
    ingredient_lines = serializers.SerializerMethodField()
    steps = serializers.SerializerMethodField()
    is_starter = serializers.SerializerMethodField()

    class Meta:
        model = StarterRecipe
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
            "is_starter",
        )
        read_only_fields = fields

    def get_description(self, obj) -> str:
        return ""

    def get_equipment_notes(self, obj) -> str:
        return ""

    def get_hero_image(self, obj) -> None:
        return None

    def get_is_starter(self, obj) -> bool:
        return True

    def get_ingredient_lines(self, obj) -> list[dict]:
        return [
            {
                "id": None,
                "ingredient": None,
                "ingredient_name": None,
                "raw_text": text,
                "quantity": None,
                "unit": "",
                "custom_unit": "",
                "prep_note": "",
                "substitution_note": "",
                "sort_order": index,
                "created_at": obj.created_at,
                "updated_at": obj.updated_at,
            }
            for index, text in enumerate(obj.ingredient_lines)
        ]

    def get_steps(self, obj) -> list[dict]:
        return [
            {
                "id": None,
                "order": index,
                "body": body,
                "created_at": obj.created_at,
                "updated_at": obj.updated_at,
            }
            for index, body in enumerate(obj.steps, start=1)
        ]
