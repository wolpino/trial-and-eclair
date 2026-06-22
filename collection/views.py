from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import CollectionIngredientLine, CollectionRecipe
from .serializers import (
    CollectionIngredientLineSerializer,
    CollectionRecipeCreateSerializer,
    CollectionRecipeSerializer,
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
            .prefetch_related("ingredient_lines__ingredient")
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
