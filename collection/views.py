from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsNotGuest
from development.models import RecipeStep
from development.services import (
    IngredientLineCopy,
    RecipeCopyPayload,
    copy_payload_to_box,
)

from .models import (
    CollectionIngredientLine,
    CollectionRecipe,
    HiddenStarterRecipe,
    StarterRecipe,
)
from .serializers import (
    CollectionIngredientLineSerializer,
    CollectionRecipeCreateSerializer,
    CollectionRecipeSerializer,
    CollectionRecipeStepSerializer,
    StarterRecipeSerializer,
)
from . import services


class RecipeBoxViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            CollectionRecipe.objects.filter(
                user=self.request.user,
                box_item__isnull=False,
            )
            .prefetch_related("ingredient_lines__ingredient", "steps")
            .order_by("title")
        )

    def get_serializer_class(self):
        if self.action == "create":
            return CollectionRecipeCreateSerializer
        return CollectionRecipeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recipe = services.create_box_recipe(
            request.user,
            **serializer.validated_data,
        )
        output = CollectionRecipeSerializer(recipe, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)


class StarterRecipeViewSet(viewsets.ReadOnlyModelViewSet):
    """Shared starter cards: readable by anyone, never edited, forkable, hideable."""

    serializer_class = StarterRecipeSerializer

    def get_permissions(self):
        if self.action == "fork":
            return [IsAuthenticated()]
        if self.action == "hide":
            return [IsNotGuest()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = StarterRecipe.objects.filter(is_active=True)
        user = self.request.user
        if self.action in ("list", "retrieve") and user.is_authenticated:
            queryset = queryset.exclude(hidden_by__user=user)
        return queryset

    @action(detail=True, methods=["post"])
    def fork(self, request, pk=None):
        starter = self.get_object()
        payload = RecipeCopyPayload(
            title=starter.title,
            prep_minutes=starter.prep_minutes,
            cook_minutes=starter.cook_minutes,
            ingredient_lines=[
                IngredientLineCopy(name="", quantity=None, raw_text=text)
                for text in starter.ingredient_lines
            ],
            step_bodies=list(starter.steps),
        )
        recipe = copy_payload_to_box(
            request.user,
            payload,
            servings=starter.servings,
            source_type=starter.source_type,
        )
        output = CollectionRecipeSerializer(recipe, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def hide(self, request, pk=None):
        starter = self.get_object()
        HiddenStarterRecipe.objects.get_or_create(user=request.user, starter=starter)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CollectionIngredientLineViewSet(viewsets.ModelViewSet):
    serializer_class = CollectionIngredientLineSerializer
    permission_classes = [IsAuthenticated]

    def _get_recipe(self) -> CollectionRecipe:
        return get_object_or_404(
            CollectionRecipe,
            pk=self.kwargs["recipe_pk"],
            user=self.request.user,
            box_item__isnull=False,
        )

    def get_queryset(self):
        return CollectionIngredientLine.objects.filter(
            recipe_id=self.kwargs["recipe_pk"],
            recipe__user=self.request.user,
        ).select_related("ingredient")

    def perform_create(self, serializer) -> None:
        serializer.save(recipe=self._get_recipe())


class CollectionRecipeStepViewSet(viewsets.ModelViewSet):
    serializer_class = CollectionRecipeStepSerializer
    permission_classes = [IsAuthenticated]

    def _get_recipe(self) -> CollectionRecipe:
        return get_object_or_404(
            CollectionRecipe,
            pk=self.kwargs["recipe_pk"],
            user=self.request.user,
            box_item__isnull=False,
        )

    def get_queryset(self):
        return RecipeStep.objects.filter(
            collection_recipe_id=self.kwargs["recipe_pk"],
            collection_recipe__user=self.request.user,
        )

    def perform_create(self, serializer) -> None:
        serializer.save(collection_recipe=self._get_recipe())
