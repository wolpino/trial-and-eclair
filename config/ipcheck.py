# TEMPORARY: shows how X-Forwarded-For arrives on Render so THROTTLE_NUM_PROXIES
# can be set. Remove once the value is chosen.
from django.http import HttpRequest, JsonResponse


def ipcheck(request: HttpRequest) -> JsonResponse:
    xff = request.META.get("HTTP_X_FORWARDED_FOR", "")
    addrs = [a.strip() for a in xff.split(",") if a.strip()]
    # Same pick DRF makes for NUM_PROXIES = n: the nth address from the right.
    by_num_proxies = {str(n): addrs[-min(n, len(addrs))] for n in range(1, 4)} if addrs else {}
    return JsonResponse(
        {
            "x_forwarded_for": xff,
            "remote_addr": request.META.get("REMOTE_ADDR", ""),
            "client_ip_if_num_proxies": by_num_proxies,
        }
    )
