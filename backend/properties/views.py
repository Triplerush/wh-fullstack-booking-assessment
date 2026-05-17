"""Vistas del catálogo."""
from rest_framework import generics, mixins, permissions, viewsets

from .filters import PropertyFilter
from .models import Amenity, Location
from .serializers import (
    AmenitySerializer,
    LocationSerializer,
    PropertyDetailSerializer,
    PropertyListSerializer,
)
from .services import base_active_queryset, get_active_property


class LocationListView(generics.ListAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class AmenityListView(generics.ListAPIView):
    serializer_class = AmenitySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = Amenity.objects.all()
        is_active = self.request.query_params.get("is_active")
        if is_active is None or is_active.lower() == "true":
            qs = qs.filter(is_active=True)
        return qs


class PropertyViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    permission_classes = [permissions.AllowAny]
    filterset_class = PropertyFilter
    lookup_field = "slug"

    def get_queryset(self):
        return base_active_queryset()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PropertyDetailSerializer
        return PropertyListSerializer

    def get_object(self):
        return get_active_property(self.kwargs[self.lookup_field])
