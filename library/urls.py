from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ReferenceLinkViewSet, ReferenceViewSet

router = DefaultRouter()
router.register("references", ReferenceViewSet, basename="reference")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "references/<uuid:reference_pk>/links/",
        ReferenceLinkViewSet.as_view({"get": "list", "post": "create"}),
        name="reference-link-list",
    ),
    path(
        "references/<uuid:reference_pk>/links/<uuid:pk>/",
        ReferenceLinkViewSet.as_view(
            {
                "get": "retrieve",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="reference-link-detail",
    ),
]
