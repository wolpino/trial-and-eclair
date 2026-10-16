"""API error shape: every non-field error is {"detail": str, "code": str}.

Field validation errors keep DRF's {"field": ["message"]} map. Nothing here
copies exception text into a response.
"""

import logging

from django.conf import settings
from rest_framework import status
from rest_framework.exceptions import ErrorDetail, ParseError
from rest_framework.response import Response
from rest_framework.views import exception_handler, set_rollback

logger = logging.getLogger(__name__)

GENERIC_ERROR_MESSAGE = "Something went wrong on our side. Please try again."
PARSE_ERROR_MESSAGE = "The request body could not be read."


class UserFacingError(Exception):
    """Domain error whose `user_message` is fixed text written for users."""

    def __init__(self, user_message: str) -> None:
        super().__init__(user_message)
        self.user_message = user_message


def api_exception_handler(exc: Exception, context: dict) -> Response | None:
    response = exception_handler(exc, context)
    if response is None:
        return _server_error(exc)
    if isinstance(exc, ParseError):
        # DRF's parse errors include the parser's exception text.
        response.data = {"detail": PARSE_ERROR_MESSAGE, "code": "parse_error"}
    elif isinstance(response.data, list):
        # ValidationError("message") renders as a bare list.
        response.data = {
            "detail": " ".join(str(item) for item in response.data),
            "code": _code_of(response.data[0]) if response.data else "invalid",
        }
    elif isinstance(response.data, dict) and "code" not in response.data:
        detail = response.data.get("detail")
        if isinstance(detail, ErrorDetail):
            response.data["code"] = detail.code
    return response


def _server_error(exc: Exception) -> Response | None:
    if settings.DEBUG:
        return None  # Let Django show its debug page locally.
    logger.error("Unhandled API error", exc_info=exc)
    set_rollback()
    return Response(
        {"detail": GENERIC_ERROR_MESSAGE, "code": "server_error"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _code_of(item: object) -> str:
    return item.code if isinstance(item, ErrorDetail) and item.code else "invalid"
