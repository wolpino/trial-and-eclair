from rest_framework import serializers

from .models import Ingredient


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ("id", "name", "default_unit")
        read_only_fields = ("id", "default_unit")


class IngredientCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)

    def create(self, validated_data: dict) -> Ingredient:
        name = validated_data["name"].strip()
        existing = Ingredient.objects.filter(name__iexact=name).first()
        if existing:
            return existing
        return Ingredient.objects.create(name=name)
