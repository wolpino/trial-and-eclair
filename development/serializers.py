from rest_framework import serializers

from .models import Idea


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
