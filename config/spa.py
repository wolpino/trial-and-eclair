from django.conf import settings
from django.http import FileResponse, HttpRequest, HttpResponse


def spa_index(_request: HttpRequest) -> FileResponse | HttpResponse:
    index = settings.FRONTEND_DIST / "index.html"
    if not index.is_file():
        return HttpResponse("Frontend build missing.", status=503)
    return FileResponse(index.open("rb"), content_type="text/html")
