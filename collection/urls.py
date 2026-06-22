from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CollectionIngredientLineViewSet, RecipeBoxViewSet

router = DefaultRouter()
router.register("recipe-box", RecipeBoxViewSet, basename="recipe-box")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "recipe-box/<uuid:recipe_pk>/ingredient-lines/",
        CollectionIngredientLineViewSet.as_view({"get": "list", "post": "create"}),
        name="recipe-box-ingredient-line-list",
    ),
    path(
        "recipe-box/<uuid:recipe_pk>/ingredient-lines/<uuid:pk>/",
        CollectionIngredientLineViewSet.as_view(
            {
                "get": "retrieve",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="recipe-box-ingredient-line-detail",
    ),
]
