"""Servicios del catálogo."""
from django.http import Http404
from django.shortcuts import get_object_or_404

from .models import Property


def get_active_property(slug: str) -> Property:
    try:
        return Property.objects.prefetch_related("images", "amenities").get(
            slug=slug, is_active=True
        )
    except Property.DoesNotExist as exc:
        raise Http404("Property not found.") from exc


def base_active_queryset():
    return (
        Property.objects.filter(is_active=True)
        .select_related("location")
        .prefetch_related("images", "amenities")
    )
