"""Serializadores del agregado bookings."""
from rest_framework import serializers

from properties.serializers import CoverImageField, LocationSerializer

from .models import Booking


class BookingPropertyDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.SerializerMethodField()
    slug = serializers.CharField()
    address = serializers.CharField()
    location = LocationSerializer()
    cover_image = CoverImageField()

    def get_title(self, obj):
        from common.localization import get_language_from_request

        lang = get_language_from_request(self.context.get("request"))
        return getattr(obj, f"title_{lang}", None) or obj.title_es


class BookingPropertyListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.SerializerMethodField()
    slug = serializers.CharField()
    cover_image = CoverImageField()

    def get_title(self, obj):
        from common.localization import get_language_from_request

        lang = get_language_from_request(self.context.get("request"))
        return getattr(obj, f"title_{lang}", None) or obj.title_es


class BookingOwnerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()
    full_name = serializers.CharField()


class BookingCreateSerializer(serializers.Serializer):
    """Entrada del POST /bookings/."""

    property_id = serializers.IntegerField()
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    guests = serializers.IntegerField(min_value=0)


class BookingDetailSerializer(serializers.ModelSerializer):
    property = BookingPropertyDetailSerializer(read_only=True)
    user = BookingOwnerSerializer(read_only=True)
    nights = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            "id",
            "code",
            "property",
            "user",
            "check_in",
            "check_out",
            "guests",
            "nights",
            "total_price",
            "currency",
            "status",
            "created_at",
        )

    def get_nights(self, obj):
        return obj.compute_nights()


class BookingListSerializer(serializers.ModelSerializer):
    property = BookingPropertyListSerializer(read_only=True)
    nights = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            "id",
            "code",
            "property",
            "check_in",
            "check_out",
            "guests",
            "nights",
            "total_price",
            "currency",
            "status",
            "created_at",
        )

    def get_nights(self, obj):
        return obj.compute_nights()


class AvailabilityRequestSerializer(serializers.Serializer):
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    guests = serializers.IntegerField(min_value=0)
