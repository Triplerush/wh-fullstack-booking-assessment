"""Serializadores del catálogo (con proyección bilingüe)."""
from rest_framework import serializers

from common.localization import LocalizedField

from .models import Amenity, Location, Property, PropertyImage


class LocationSerializer(serializers.ModelSerializer):
    name = LocalizedField("name")

    class Meta:
        model = Location
        fields = ("id", "name", "slug", "country")


class AmenitySerializer(serializers.ModelSerializer):
    name = LocalizedField("name")

    class Meta:
        model = Amenity
        fields = ("id", "name", "slug", "icon")


class PropertyImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    alt = LocalizedField("alt")

    class Meta:
        model = PropertyImage
        fields = ("id", "url", "alt", "order", "is_cover")

    def get_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request") if self.context else None
        url = obj.image.url
        if request is not None:
            return request.build_absolute_uri(url)
        return url


class CoverImageField(serializers.Field):
    """Inserta la imagen de portada (o la primera) como `{url, alt}`."""

    def __init__(self, **kwargs):
        kwargs.setdefault("read_only", True)
        super().__init__(**kwargs)

    def get_attribute(self, instance):
        return instance

    def to_representation(self, prop):
        cover = next(
            (img for img in prop.images.all() if img.is_cover),
            prop.images.first(),
        )
        if cover is None:
            return None
        serializer = PropertyImageSerializer(cover, context=self.context)
        data = serializer.data
        return {"url": data["url"], "alt": data["alt"]}


class PropertyListSerializer(serializers.ModelSerializer):
    title = LocalizedField("title")
    location = LocationSerializer(read_only=True)
    cover_image = CoverImageField()
    gallery = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = (
            "id",
            "title",
            "slug",
            "location",
            "address",
            "lat",
            "lng",
            "max_guests",
            "bedrooms",
            "bathrooms",
            "price_per_night",
            "currency",
            "is_featured",
            "cover_image",
            "gallery",
        )

    def get_gallery(self, prop):
        images = sorted(prop.images.all(), key=lambda i: (not i.is_cover, i.order))[:5]
        return PropertyImageSerializer(images, many=True, context=self.context).data


class PropertyDetailSerializer(PropertyListSerializer):
    description = LocalizedField("description")
    amenities = AmenitySerializer(many=True, read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta(PropertyListSerializer.Meta):
        fields = PropertyListSerializer.Meta.fields + (
            "description",
            "amenities",
            "images",
        )
