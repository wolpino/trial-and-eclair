from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from collection.serializers import CollectionRecipeSerializer

from .models import Cookbook, DevelopmentRecipe, ForkType
from .serializers import (
    DevelopmentRecipeSerializer,
    ForkRecipeSerializer,
    PublicCookbookSerializer,
    PublicRecipeSerializer,
)
from . import services


def build_public_recipe_payload(recipe: DevelopmentRecipe) -> dict:
    if recipe.status != "published" or recipe.published_version_id is None:
        raise NotFound("Recipe not found.")

    version = recipe.published_version
    fork_lineage = None
    if recipe.user.show_forks and recipe.fork_record_id is not None:
        source_recipe = recipe.fork_record.forked_from_version.recipe
        fork_lineage = {
            "title": source_recipe.title,
            "author": recipe.fork_record.forked_from_user.username,
            "slug": source_recipe.slug if source_recipe.status == "published" else None,
        }

    return {
        "slug": recipe.slug,
        "title": version.title,
        "description": version.description,
        "story": version.story,
        "hero_image": version.hero_image,
        "equipment_notes": version.equipment_notes,
        "prep_minutes": version.prep_minutes,
        "cook_minutes": version.cook_minutes,
        "author": recipe.user.username,
        "published_at": recipe.published_at,
        "ingredient_lines": version.ingredient_lines.select_related("ingredient").all(),
        "steps": version.steps.all(),
        "fork_lineage": fork_lineage,
    }


class PublicRecipeView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicRecipeSerializer
    lookup_field = "slug"

    def get_object(self) -> dict:
        recipe = (
            DevelopmentRecipe.objects.filter(
                slug=self.kwargs["slug"],
                status="published",
            )
            .select_related(
                "user",
                "published_version",
                "fork_record__forked_from_version__recipe",
                "fork_record__forked_from_user",
            )
            .prefetch_related(
                "published_version__ingredient_lines__ingredient",
                "published_version__steps",
            )
            .first()
        )
        if recipe is None:
            raise NotFound("Recipe not found.")
        return build_public_recipe_payload(recipe)


def build_public_cookbook_payload(cookbook: Cookbook) -> dict:
    if cookbook.status != "published":
        raise NotFound("Cookbook not found.")

    recipes = []
    for entry in cookbook.entries.select_related("recipe", "snapshot_version").order_by(
        "sort_order"
    ):
        snapshot = entry.snapshot_version
        recipe = entry.recipe
        recipes.append(
            {
                "title": snapshot.title,
                "description": snapshot.description,
                "sort_order": entry.sort_order,
                "recipe_slug": recipe.slug if recipe.status == "published" else None,
            }
        )

    return {
        "slug": cookbook.slug,
        "title": cookbook.title,
        "description": cookbook.description,
        "author": cookbook.user.username,
        "published_at": cookbook.published_at,
        "recipes": recipes,
    }


class ForkPublicRecipeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug: str) -> Response:
        serializer = ForkRecipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fork_type = serializer.validated_data["fork_type"]
        if fork_type == ForkType.REWORK and not request.user.has_developer_access():
            raise PermissionDenied("Rework requires developer access.")

        recipe = (
            DevelopmentRecipe.objects.filter(slug=slug, status="published")
            .select_related("user", "published_version")
            .prefetch_related(
                "published_version__ingredient_lines__ingredient",
                "published_version__steps",
            )
            .first()
        )
        if recipe is None or recipe.published_version_id is None:
            raise NotFound("Recipe not found.")

        version = recipe.published_version
        if fork_type == ForkType.SAVE_TO_BOX:
            created = services.fork_to_box(request.user, version, recipe.user)
            body = {
                "fork_type": fork_type,
                "fork_id": str(created.fork_record_id),
                "recipe": CollectionRecipeSerializer(
                    created, context={"request": request}
                ).data,
            }
        else:
            created = services.fork_to_lab(request.user, version, recipe.user)
            body = {
                "fork_type": fork_type,
                "fork_id": str(created.fork_record_id),
                "recipe": DevelopmentRecipeSerializer(
                    created, context={"request": request}
                ).data,
            }
        return Response(body, status=status.HTTP_201_CREATED)


class PublicCookbookView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicCookbookSerializer
    lookup_field = "slug"

    def get_object(self) -> dict:
        cookbook = (
            Cookbook.objects.filter(slug=self.kwargs["slug"], status="published")
            .select_related("user")
            .prefetch_related("entries__recipe", "entries__snapshot_version")
            .first()
        )
        if cookbook is None:
            raise NotFound("Cookbook not found.")
        return build_public_cookbook_payload(cookbook)
