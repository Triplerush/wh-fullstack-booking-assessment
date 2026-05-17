"""Modelos del catálogo: Location, Property, PropertyImage, Amenity."""
from django.db import models
from django.utils.text import slugify

from common.imaging import optimize_image


class Location(models.Model):
    name_es = models.CharField(max_length=120)
    name_en = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    country = models.CharField(max_length=80, default="España")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name_es",)
        indexes = [models.Index(fields=["country"])]

    def __str__(self):
        return self.name_es


class Amenity(models.Model):
    name_es = models.CharField(max_length=120)
    name_en = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    icon = models.CharField(max_length=60, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("order", "name_es")
        indexes = [models.Index(fields=["is_active", "order"])]
        verbose_name_plural = "amenities"

    def __str__(self):
        return self.name_es


class Property(models.Model):
    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="properties"
    )
    title_es = models.CharField(max_length=180)
    title_en = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    description_es = models.TextField(blank=True)
    description_en = models.TextField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    max_guests = models.PositiveSmallIntegerField()
    bedrooms = models.PositiveSmallIntegerField(default=0)
    bathrooms = models.PositiveSmallIntegerField(default=0)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    amenities = models.ManyToManyField(Amenity, related_name="properties", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-is_featured", "price_per_night")
        constraints = [
            models.CheckConstraint(
                check=models.Q(max_guests__gt=0), name="property_max_guests_positive"
            ),
            models.CheckConstraint(
                check=models.Q(price_per_night__gte=0),
                name="property_price_non_negative",
            ),
        ]
        indexes = [
            models.Index(fields=["location"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["is_featured"]),
            models.Index(fields=["price_per_night"]),
        ]
        verbose_name_plural = "properties"

    def __str__(self):
        return self.title_es


def _image_upload_to(instance, filename):
    base = instance.property.slug or slugify(instance.property.title_es)
    return f"properties/{base}/{filename}"


class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to=_image_upload_to, blank=True)
    alt_es = models.CharField(max_length=255, blank=True)
    alt_en = models.CharField(max_length=255, blank=True)
    order = models.IntegerField(default=0)
    is_cover = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("order", "id")
        indexes = [
            models.Index(fields=["property", "order"]),
            models.Index(fields=["is_cover"]),
        ]

    def __str__(self):
        return f"{self.property.slug} #{self.order}"

    def save(self, *args, **kwargs):
        if self.image and not str(self.image.name).endswith(".webp"):
            slug = self.property.slug or slugify(self.property.title_es)
            optimized = optimize_image(self.image, slug)
            self.image.save(optimized.name, optimized, save=False)
        super().save(*args, **kwargs)
