from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .public_views import PublicCookbookView, PublicRecipeView
from .views import (
    CookbookEntryViewSet,
    CookbookViewSet,
    DevelopmentRecipeViewSet,
    IdeaViewSet,
    JournalEntryViewSet,
    RecipeVersionViewSet,
    TestSessionPhotoViewSet,
    TestSessionViewSet,
    VersionIngredientLineViewSet,
    VersionRecipeStepViewSet,
)

router = DefaultRouter()
router.register("ideas", IdeaViewSet, basename="idea")
router.register("recipes", DevelopmentRecipeViewSet, basename="recipe")
router.register("journal", JournalEntryViewSet, basename="journal")
router.register("cookbooks", CookbookViewSet, basename="cookbook")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "public/recipes/<slug:slug>/",
        PublicRecipeView.as_view(),
        name="public-recipe-detail",
    ),
    path(
        "public/cookbooks/<slug:slug>/",
        PublicCookbookView.as_view(),
        name="public-cookbook-detail",
    ),
    path(
        "cookbooks/<uuid:cookbook_pk>/entries/",
        CookbookEntryViewSet.as_view({"get": "list", "post": "create"}),
        name="cookbook-entry-list",
    ),
    path(
        "cookbooks/<uuid:cookbook_pk>/entries/<uuid:pk>/",
        CookbookEntryViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="cookbook-entry-detail",
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
    path(
        "versions/<uuid:version_pk>/steps/",
        VersionRecipeStepViewSet.as_view({"get": "list", "post": "create"}),
        name="version-step-list",
    ),
    path(
        "versions/<uuid:version_pk>/steps/<uuid:pk>/",
        VersionRecipeStepViewSet.as_view(
            {
                "get": "retrieve",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="version-step-detail",
    ),
    path(
        "versions/<uuid:version_pk>/test-sessions/",
        TestSessionViewSet.as_view({"get": "list", "post": "create"}),
        name="version-test-session-list",
    ),
    path(
        "versions/<uuid:version_pk>/test-sessions/<uuid:pk>/",
        TestSessionViewSet.as_view(
            {
                "get": "retrieve",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="version-test-session-detail",
    ),
    path(
        "test-sessions/<uuid:session_pk>/photos/",
        TestSessionPhotoViewSet.as_view({"get": "list", "post": "create"}),
        name="test-session-photo-list",
    ),
    path(
        "test-sessions/<uuid:session_pk>/photos/<uuid:pk>/",
        TestSessionPhotoViewSet.as_view({"get": "retrieve", "delete": "destroy"}),
        name="test-session-photo-detail",
    ),
]
