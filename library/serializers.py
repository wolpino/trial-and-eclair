from rest_framework import serializers

from development.models import ForkType

from .models import Reference, ReferenceLink, ReferenceType, SourceDocument, UrlRecipeImport


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


class UrlImportCreateSerializer(serializers.Serializer):
    url = serializers.URLField(max_length=2048)


class UrlRecipeImportSerializer(serializers.ModelSerializer):
    class Meta:
        model = UrlRecipeImport
        fields = (
            "id",
            "normalized_url",
            "source_title",
            "source_author",
            "source_site",
            "parsed_data",
            "last_fetched_at",
            "fetch_error",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class UrlImportSaveSerializer(serializers.Serializer):
    fork_type = serializers.ChoiceField(choices=ForkType.choices)


class ScanImportSerializer(serializers.Serializer):
    file = serializers.FileField()
    destination = serializers.ChoiceField(
        choices=("box", "lab"),
        required=False,
        default="box",
    )


class SourceDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceDocument
        fields = (
            "id",
            "original_filename",
            "mime_type",
            "extracted_text",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
