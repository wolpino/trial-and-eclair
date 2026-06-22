from rest_framework.permissions import BasePermission


class IsDeveloper(BasePermission):
    message = "Developer subscription required."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.is_developer())
