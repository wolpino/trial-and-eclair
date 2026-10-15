from rest_framework.permissions import BasePermission


class IsNotGuest(BasePermission):
    message = "Sign up to use this feature."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and not user.is_guest)


class IsDeveloper(BasePermission):
    message = "Developer access requires an active trial or subscription."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.has_developer_access())
