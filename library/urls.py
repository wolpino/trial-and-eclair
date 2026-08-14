from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ReferenceLinkViewSet,
    ReferenceViewSet,
    ScanImportView,
    UrlImportCreateView,
    UrlImportDetailView,
    UrlImportSaveView,
)

router = DefaultRouter()
router.register("references", ReferenceViewSet, basename="reference")

urlpatterns = [
    path("", include(router.urls)),
    path("imports/url/", UrlImportCreateView.as_view(), name="url-import-create"),
    path(
        "imports/url/<uuid:pk>/",
        UrlImportDetailView.as_view(),
        name="url-import-detail",
    ),
    path(
        "imports/url/<uuid:pk>/save/",
        UrlImportSaveView.as_view(),
        name="url-import-save",
    ),
    path("imports/scan/", ScanImportView.as_view(), name="scan-import"),
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
