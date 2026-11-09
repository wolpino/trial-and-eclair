import uuid

from django.db.models import Prefetch
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from accounts.permissions import IsDeveloper
from config.exceptions import UserFacingError

from .models import (
    Cookbook,
    CookbookRecipe,
    DevelopmentRecipe,
    Idea,
    JournalEntry,
    RecipeStep,
    RecipeVersion,
    TestSession,
    TestSessionPhoto,
    VersionIngredientLine,
)
from .serializers import (
    CookbookCreateSerializer,
    CookbookRecipeCreateSerializer,
    CookbookRecipeSerializer,
    CookbookRecipeUpdateSerializer,
    CookbookSerializer,
    DevelopmentRecipeCreateSerializer,
    DevelopmentRecipeSerializer,
    IdeaSerializer,
    JournalEntrySerializer,
    PromoteIdeaSerializer,
    PublishCookbookSerializer,
    PublishRecipeSerializer,
    RecipeStepSerializer,
    RecipeVersionSerializer,
    SampleRecipeSerializer,
    SaveNewVersionSerializer,
    TestSessionPhotoSerializer,
    TestSessionSerializer,
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

    @action(detail=True, methods=["post"])
    def promote(self, request, pk=None) -> Response:
        idea = self.get_object()
        serializer = PromoteIdeaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        title = serializer.validated_data.get("title", "").strip()
        try:
            services.promote_idea(idea, title=title or None)
        except services.RecipeError as exc:
            raise ValidationError(exc.user_message) from exc
        idea.refresh_from_db()
        return Response(
            IdeaSerializer(idea, context=self.get_serializer_context()).data,
            status=status.HTTP_200_OK,
        )


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
        except services.RecipeError as exc:
            raise ValidationError(exc.user_message) from exc
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
        except services.RecipeError as exc:
            raise ValidationError(exc.user_message) from exc
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
            .prefetch_related("ingredient_lines__ingredient", "steps")
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


class VersionRecipeStepViewSet(viewsets.ModelViewSet):
    serializer_class = RecipeStepSerializer
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
        return RecipeStep.objects.filter(
            version_id=self.kwargs["version_pk"],
            version__recipe__user=self.request.user,
        )

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


MAX_TEST_SESSION_PHOTOS = 5


class TestSessionViewSet(viewsets.ModelViewSet):
    serializer_class = TestSessionSerializer
    permission_classes = [IsDeveloper]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def _get_version(self) -> RecipeVersion:
        return get_object_or_404(
            RecipeVersion.objects.select_related("recipe"),
            pk=self.kwargs["version_pk"],
            recipe__user=self.request.user,
        )

    def get_queryset(self):
        return TestSession.objects.filter(
            version_id=self.kwargs["version_pk"],
            version__recipe__user=self.request.user,
        ).prefetch_related("photos")

    def perform_create(self, serializer) -> None:
        serializer.save(version=self._get_version())


class TestSessionPhotoViewSet(viewsets.ModelViewSet):
    serializer_class = TestSessionPhotoSerializer
    permission_classes = [IsDeveloper]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def _get_session(self) -> TestSession:
        return get_object_or_404(
            TestSession.objects.select_related("version__recipe"),
            pk=self.kwargs["session_pk"],
            version__recipe__user=self.request.user,
        )

    def get_queryset(self):
        return TestSessionPhoto.objects.filter(
            session_id=self.kwargs["session_pk"],
            session__version__recipe__user=self.request.user,
        )

    def perform_create(self, serializer) -> None:
        session = self._get_session()
        if session.photos.count() >= MAX_TEST_SESSION_PHOTOS:
            raise ValidationError(f"A test session may have at most {MAX_TEST_SESSION_PHOTOS} photos.")
        serializer.save(session=session)


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
            try:
                recipe_id = uuid.UUID(recipe_id)
            except ValueError as exc:
                raise ValidationError("Pick a valid recipe.") from exc
            queryset = queryset.filter(recipe_id=recipe_id)
        return queryset

    def perform_create(self, serializer) -> None:
        serializer.save(user=self.request.user)


class CookbookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsDeveloper]

    def get_queryset(self):
        return Cookbook.objects.filter(user=self.request.user).prefetch_related("entries")

    def get_serializer_class(self):
        if self.action == "create":
            return CookbookCreateSerializer
        return CookbookSerializer

    def perform_create(self, serializer) -> None:
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cookbook = serializer.save(user=request.user)
        output = CookbookSerializer(cookbook, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None) -> Response:
        cookbook = self.get_object()
        serializer = PublishCookbookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cookbook = services.publish_cookbook(
            cookbook,
            slug=serializer.validated_data.get("slug", ""),
        )
        return Response(
            CookbookSerializer(cookbook, context=self.get_serializer_context()).data
        )

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None) -> Response:
        cookbook = self.get_object()
        cookbook = services.unpublish_cookbook(cookbook)
        return Response(
            CookbookSerializer(cookbook, context=self.get_serializer_context()).data
        )


class CookbookEntryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsDeveloper]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return CookbookRecipeCreateSerializer
        return CookbookRecipeSerializer

    def get_queryset(self):
        return CookbookRecipe.objects.filter(
            cookbook_id=self.kwargs["cookbook_pk"],
            cookbook__user=self.request.user,
        )

    def create(self, request, *args, **kwargs):
        cookbook = get_object_or_404(
            Cookbook,
            pk=self.kwargs["cookbook_pk"],
            user=request.user,
        )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        recipe = get_object_or_404(
            DevelopmentRecipe,
            pk=data["recipe"],
            user=request.user,
        )
        try:
            entry = services.add_cookbook_entry(
                cookbook,
                recipe,
                version_id=data.get("version_id"),
                sort_order=data.get("sort_order", 0),
            )
        except services.RecipeError as exc:
            raise ValidationError(exc.user_message) from exc
        output = CookbookRecipeSerializer(entry, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs) -> Response:
        entry = self.get_object()
        serializer = CookbookRecipeUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry.sort_order = serializer.validated_data["sort_order"]
        entry.save(update_fields=["sort_order", "updated_at"])
        return Response(
            CookbookRecipeSerializer(entry, context=self.get_serializer_context()).data
        )


class SampleReadOnly(UserFacingError):
    code = "sample_read_only"


class SampleViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    """Shared sample content for any signed-in user. Writes are refused."""

    def _refuse(self, *args, **kwargs) -> Response:
        exc = SampleReadOnly("Sample content is read-only.")
        raise PermissionDenied({"detail": exc.user_message, "code": exc.code})

    create = update = partial_update = destroy = _refuse


class SampleIdeaViewSet(SampleViewSet):
    serializer_class = IdeaSerializer

    def get_queryset(self):
        return Idea.objects.filter(is_sample=True)


class SampleRecipeViewSet(SampleViewSet):
    serializer_class = SampleRecipeSerializer

    def get_queryset(self):
        versions = RecipeVersion.objects.prefetch_related(
            "ingredient_lines__ingredient", "steps", "test_sessions__photos"
        ).order_by("version_number")
        return (
            DevelopmentRecipe.objects.filter(is_sample=True)
            .select_related("current_version", "published_version")
            .prefetch_related(Prefetch("versions", queryset=versions))
        )
