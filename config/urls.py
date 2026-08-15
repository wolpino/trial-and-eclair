from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

from config.health import healthz
from config.spa import spa_index

urlpatterns = [
    path("healthz", healthz),
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/", include("development.urls")),
    path("api/v1/", include("collection.urls")),
    path("api/v1/", include("library.urls")),
    path("api/v1/", include("catalog.urls")),
]

if settings.SERVE_MEDIA:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    re_path(r"^(?!api/|admin/|static/|media/|healthz).*$", spa_index),
]
