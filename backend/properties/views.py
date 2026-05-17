"""Vistas del catálogo."""
from decimal import Decimal

from rest_framework import generics, mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from bookings.serializers import AvailabilityRequestSerializer
from bookings.services import compute_total, validate_booking_request

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

    @action(detail=True, methods=["post"], url_path="check-availability")
    def check_availability(self, request, slug=None):
        prop = get_active_property(slug)
        input_serializer = AvailabilityRequestSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        check_in = input_serializer.validated_data["check_in"]
        check_out = input_serializer.validated_data["check_out"]
        guests = input_serializer.validated_data["guests"]
        try:
            validate_booking_request(
                prop, check_in=check_in, check_out=check_out, guests=guests
            )
        except ValidationError as exc:
            return Response(
                {"available": False, "errors": exc.detail},
                status=200,
            )
        nights = (check_out - check_in).days
        total = compute_total(prop, check_in, check_out)
        return Response(
            {
                "available": True,
                "nights": nights,
                "total_price": f"{total:.2f}",
                "currency": prop.currency,
            },
            status=200,
        )
