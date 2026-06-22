from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .public_views import PublicRecipeView
from .views import (
    DevelopmentRecipeViewSet,
    IdeaViewSet,
    RecipeVersionViewSet,
    VersionIngredientLineViewSet,
)

router = DefaultRouter()
router.register("ideas", IdeaViewSet, basename="idea")
router.register("recipes", DevelopmentRecipeViewSet, basename="recipe")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "public/recipes/<slug:slug>/",
        PublicRecipeView.as_view(),
        name="public-recipe-detail",
    ),
    path(
        "recipes/<uuid:recipe_pk>/versions/",
        RecipeVersionViewSet.as_view({"get": "list"}),
        name="recipe-version-list",
    ),
    path(
        "recipes/<uuid:recipe_pk>/versions/<uuid:pk>/",
        RecipeVersionViewSet.as_view({"get": "retrieve", "patch": "partial_update"}),
        name="recipe-version-detail",
    ),
    path(
        "versions/<uuid:version_pk>/ingredient-lines/",
        VersionIngredientLineViewSet.as_view({"get": "list", "post": "create"}),
        name="version-ingredient-line-list",
    ),
    path(
        "versions/<uuid:version_pk>/ingredient-lines/<uuid:pk>/",
        VersionIngredientLineViewSet.as_view(
            {
                "get": "retrieve",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="version-ingredient-line-detail",
    ),
]
