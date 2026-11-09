import uuid

from django.contrib.auth import login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import User, UserRole
from .permissions import IsNotGuest
from .serializers import LoginSerializer, MeUpdateSerializer, RegisterSerializer, UserSerializer
from .services import TrialUnavailable, start_developer_trial


class IPScopedRateThrottle(ScopedRateThrottle):
    """Scoped throttle keyed by client IP even when the caller is signed in."""

    def get_cache_key(self, request: Request, view) -> str:
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


@method_decorator(ensure_csrf_cookie, name="dispatch")
class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [IPScopedRateThrottle]
    throttle_scope = "register"

    def post(self, request: Request) -> Response:
        current = request.user
        guest = current if current.is_authenticated and current.is_guest else None
        serializer = RegisterSerializer(data=request.data, context={"guest": guest})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


@method_decorator(ensure_csrf_cookie, name="dispatch")
class GuestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [IPScopedRateThrottle]
    throttle_scope = "guest_create"

    def post(self, request: Request) -> Response:
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        user = User(
            username=f"guest-{uuid.uuid4().hex[:16]}",
            role=UserRole.HOME_COOK,
            is_guest=True,
        )
        user.set_unusable_password()
        user.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [IPScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    def post(self, request: Request) -> Response:
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class MeView(APIView):
    def get(self, request: Request) -> Response:
        return Response(UserSerializer(request.user).data)

    def patch(self, request: Request) -> Response:
        if request.user.is_guest:
            raise PermissionDenied(IsNotGuest.message)
        serializer = MeUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class StartTrialView(APIView):
    permission_classes = [IsAuthenticated, IsNotGuest]

    def post(self, request: Request) -> Response:
        try:
            user = start_developer_trial(request.user)
        except TrialUnavailable as exc:
            raise ValidationError(exc.user_message) from exc
        return Response(UserSerializer(user).data)
