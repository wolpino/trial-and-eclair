from rest_framework import serializers

from .models import Reference, ReferenceLink, ReferenceType


class ReferenceLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferenceLink
        fields = (
            "id",
            "idea",
            "recipe_version",
            "note",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate(self, attrs: dict) -> dict:
        idea = attrs.get("idea", getattr(self.instance, "idea", None))
        recipe_version = attrs.get(
            "recipe_version",
            getattr(self.instance, "recipe_version", None),
        )
        if idea is None and recipe_version is None:
            raise serializers.ValidationError(
                "Link must target an idea or recipe version."
            )

        user = self.context["request"].user
        if idea is not None and idea.user_id != user.id:
            raise serializers.ValidationError({"idea": "Idea not found."})
        if recipe_version is not None and recipe_version.recipe.user_id != user.id:
            raise serializers.ValidationError(
                {"recipe_version": "Recipe version not found."}
            )
        return attrs


class ReferenceSerializer(serializers.ModelSerializer):
    links = ReferenceLinkSerializer(many=True, read_only=True)

    class Meta:
        model = Reference
        fields = (
            "id",
            "ref_type",
            "title",
            "url",
            "notes",
            "links",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "links", "created_at", "updated_at")

    def validate_ref_type(self, value: str) -> str:
        if value not in ReferenceType.values:
            raise serializers.ValidationError("Invalid reference type.")
        return value
