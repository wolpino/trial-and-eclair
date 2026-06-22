from rest_framework import viewsets

from accounts.permissions import IsDeveloper

from .models import Idea
from .serializers import IdeaSerializer


class IdeaViewSet(viewsets.ModelViewSet):
    serializer_class = IdeaSerializer
    permission_classes = [IsDeveloper]

    def get_queryset(self):
        return Idea.objects.filter(user=self.request.user)

    def perform_create(self, serializer) -> None:
        serializer.save(user=self.request.user)
