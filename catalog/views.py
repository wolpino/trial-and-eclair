from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Ingredient
from .serializers import IngredientCreateSerializer, IngredientSerializer


class IngredientViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = IngredientSerializer

    def get_queryset(self):
        queryset = Ingredient.objects.all()
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset[:25]

    def get_serializer_class(self):
        if self.action == "create":
            return IngredientCreateSerializer
        return IngredientSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ingredient = serializer.save()
        output = IngredientSerializer(ingredient)
        return Response(output.data, status=status.HTTP_201_CREATED)
