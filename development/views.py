from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from accounts.permissions import IsDeveloper

from .models import DevelopmentRecipe, Idea, JournalEntry, RecipeVersion, VersionIngredientLine
from .serializers import (
    DevelopmentRecipeCreateSerializer,
    DevelopmentRecipeSerializer,
    IdeaSerializer,
    JournalEntrySerializer,
    PublishRecipeSerializer,
    RecipeVersionSerializer,
    SaveNewVersionSerializer,
    VersionIngredientLineSerializer,
)
from . import services


class IdeaViewSet(viewsets.ModelViewSet):
    serializer_class = IdeaSerializer
    permission_classes = [IsDeveloper]

    def get_queryset(self):
        return Idea.objects.filter(user=self.request.user)

    def perform_create(self, serializer) -> None:
        serializer.save(user=self.request.user)


class DevelopmentRecipeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsDeveloper]

    def get_queryset(self):
        return DevelopmentRecipe.objects.filter(user=self.request.user).select_related(
            "current_version",
            "published_version",
        )

    def get_serializer_class(self):
        if self.action == "create":
            return DevelopmentRecipeCreateSerializer
        return DevelopmentRecipeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recipe = services.create_development_recipe(
            request.user,
            title=serializer.validated_data["title"],
        )
        output = DevelopmentRecipeSerializer(recipe, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="save-new-version")
    def save_new_version(self, request, pk=None) -> Response:
        recipe = self.get_object()
        serializer = SaveNewVersionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_version = services.save_new_version(
            recipe,
            version_notes=serializer.validated_data.get("version_notes", ""),
        )
        return Response(
            RecipeVersionSerializer(new_version, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None) -> Response:
        recipe = self.get_object()
        serializer = PublishRecipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            recipe = services.publish_recipe(
                recipe,
                version_id=data.get("version_id"),
                slug=data.get("slug", ""),
                story=data.get("story") if "story" in data else None,
                hero_image=data.get("hero_image"),
            )
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc
        recipe.refresh_from_db()
        return Response(
            DevelopmentRecipeSerializer(recipe, context=self.get_serializer_context()).data
        )

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None) -> Response:
        recipe = self.get_object()
        recipe = services.unpublish_recipe(recipe)
        recipe.refresh_from_db()
        return Response(
            DevelopmentRecipeSerializer(recipe, context=self.get_serializer_context()).data
        )

    @action(detail=True, methods=["get"], url_path="compare-versions")
    def compare_versions(self, request, pk=None) -> Response:
        recipe = self.get_object()
        left_id = request.query_params.get("left")
        right_id = request.query_params.get("right")
        if not left_id or not right_id:
            raise ValidationError("Query params 'left' and 'right' are required.")

        left = get_object_or_404(recipe.versions, pk=left_id)
        right = get_object_or_404(recipe.versions, pk=right_id)
        try:
            diff = services.compare_versions(left, right)
        except ValueError as exc:
            raise ValidationError(str(exc)) from exc
        return Response(diff)


class RecipeVersionViewSet(viewsets.ModelViewSet):
    serializer_class = RecipeVersionSerializer
    permission_classes = [IsDeveloper]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return (
            RecipeVersion.objects.filter(
                recipe_id=self.kwargs["recipe_pk"],
                recipe__user=self.request.user,
            )
            .prefetch_related("ingredient_lines__ingredient")
            .order_by("version_number")
        )

    def partial_update(self, request, *args, **kwargs) -> Response:
        version = self.get_object()
        if version.id != version.recipe.current_version_id:
            raise PermissionDenied("Only the current version can be edited.")
        return super().partial_update(request, *args, **kwargs)


class VersionIngredientLineViewSet(viewsets.ModelViewSet):
    serializer_class = VersionIngredientLineSerializer
    permission_classes = [IsDeveloper]

    def _get_version(self) -> RecipeVersion:
        return get_object_or_404(
            RecipeVersion.objects.select_related("recipe"),
            pk=self.kwargs["version_pk"],
            recipe__user=self.request.user,
        )

    def _ensure_current_version(self, version: RecipeVersion) -> None:
        if version.id != version.recipe.current_version_id:
            raise PermissionDenied("Only the current version can be edited.")

    def get_queryset(self):
        return VersionIngredientLine.objects.filter(
            version_id=self.kwargs["version_pk"],
            version__recipe__user=self.request.user,
        ).select_related("ingredient")

    def perform_create(self, serializer) -> None:
        version = self._get_version()
        self._ensure_current_version(version)
        serializer.save(version=version)

    def perform_update(self, serializer) -> None:
        self._ensure_current_version(serializer.instance.version)
        serializer.save()

    def perform_destroy(self, instance) -> None:
        self._ensure_current_version(instance.version)
        instance.delete()


class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    permission_classes = [IsDeveloper]

    def get_queryset(self):
        queryset = JournalEntry.objects.filter(user=self.request.user).select_related(
            "recipe",
            "version_snapshot",
        )
        recipe_id = self.request.query_params.get("recipe")
        if recipe_id:
            queryset = queryset.filter(recipe_id=recipe_id)
        return queryset

    def perform_create(self, serializer) -> None:
        serializer.save(user=self.request.user)
