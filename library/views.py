from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Reference, ReferenceLink
from .serializers import ReferenceLinkSerializer, ReferenceSerializer


class ReferenceViewSet(viewsets.ModelViewSet):
    serializer_class = ReferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Reference.objects.filter(user=self.request.user).prefetch_related(
            "links"
        )
        ref_type = self.request.query_params.get("ref_type")
        if ref_type:
            queryset = queryset.filter(ref_type=ref_type)
        return queryset

    def perform_create(self, serializer) -> None:
        serializer.save(user=self.request.user)


class ReferenceLinkViewSet(viewsets.ModelViewSet):
    serializer_class = ReferenceLinkSerializer
    permission_classes = [IsAuthenticated]

    def _get_reference(self) -> Reference:
        return get_object_or_404(
            Reference,
            pk=self.kwargs["reference_pk"],
            user=self.request.user,
        )

    def get_queryset(self):
        return ReferenceLink.objects.filter(
            reference_id=self.kwargs["reference_pk"],
            reference__user=self.request.user,
        )

    def perform_create(self, serializer) -> None:
        serializer.save(reference=self._get_reference())
