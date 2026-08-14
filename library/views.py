from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from collection.serializers import CollectionRecipeSerializer
from development.models import DevelopmentRecipe, ForkType
from development.serializers import DevelopmentRecipeSerializer

from .models import Reference, ReferenceLink, UrlRecipeImport
from .serializers import (
    ReferenceLinkSerializer,
    ReferenceSerializer,
    ScanImportSerializer,
    SourceDocumentSerializer,
    UrlImportCreateSerializer,
    UrlImportSaveSerializer,
    UrlRecipeImportSerializer,
)
from . import services


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


def _rework_denied_if_needed(user, fork_type: str) -> None:
    if fork_type == ForkType.REWORK and not user.has_developer_access():
        raise PermissionDenied("Rework requires developer access.")


def _imported_recipe_payload(request, recipe) -> dict:
    if isinstance(recipe, DevelopmentRecipe):
        serialized = DevelopmentRecipeSerializer(recipe, context={"request": request})
    else:
        serialized = CollectionRecipeSerializer(recipe, context={"request": request})
    return serialized.data


class UrlImportCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request) -> Response:
        serializer = UrlImportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        url = serializer.validated_data["url"]
        try:
            record = services.import_from_url(url)
        except services.UnsafeURLError as exc:
            raise PermissionDenied(str(exc)) from exc
        except services.RobotsDisallowedError as exc:
            raise PermissionDenied(str(exc)) from exc
        except services.FetchError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        output = UrlRecipeImportSerializer(record)
        return Response(output.data, status=status.HTTP_201_CREATED)


class UrlImportDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk) -> Response:
        record = get_object_or_404(UrlRecipeImport, pk=pk)
        return Response(UrlRecipeImportSerializer(record).data)


class UrlImportSaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk) -> Response:
        record = get_object_or_404(UrlRecipeImport, pk=pk)
        serializer = UrlImportSaveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fork_type = serializer.validated_data["fork_type"]
        _rework_denied_if_needed(request.user, fork_type)
        recipe = services.save_url_import(
            request.user,
            record,
            fork_type=fork_type,
        )
        return Response(
            {
                "fork_type": fork_type,
                "recipe": _imported_recipe_payload(request, recipe),
            },
            status=status.HTTP_201_CREATED,
        )


class ScanImportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request) -> Response:
        serializer = ScanImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        destination = serializer.validated_data.get("destination") or "box"
        if destination == "lab" and not request.user.has_developer_access():
            raise PermissionDenied("Lab import requires developer access.")
        document, recipe = services.create_scan_import(
            request.user,
            serializer.validated_data["file"],
            destination=destination,
        )
        return Response(
            {
                "destination": destination,
                "source_document": SourceDocumentSerializer(document).data,
                "recipe": _imported_recipe_payload(request, recipe),
            },
            status=status.HTTP_201_CREATED,
        )
