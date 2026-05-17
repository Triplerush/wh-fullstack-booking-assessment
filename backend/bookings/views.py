from rest_framework import mixins, permissions, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from common.localization import get_language_from_request

from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer,
    BookingListSerializer,
)
from .services import create_booking


class BookingViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingDetailSerializer

    def get_queryset(self):
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related("property", "property__location", "user")
            .prefetch_related("property__images")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return BookingListSerializer
        if self.action == "create":
            return BookingCreateSerializer
        return BookingDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            booking = create_booking(
                user=request.user,
                property_id=serializer.validated_data["property_id"],
                check_in=serializer.validated_data["check_in"],
                check_out=serializer.validated_data["check_out"],
                guests=serializer.validated_data["guests"],
                language=get_language_from_request(request),
            )
        except ValidationError:
            raise
        booking = (
            Booking.objects.select_related("property", "property__location", "user")
            .prefetch_related("property__images")
            .get(id=booking.id)
        )
        out = BookingDetailSerializer(booking, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)
