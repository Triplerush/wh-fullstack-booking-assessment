"""Conjunto de filtros para el endpoint de listado de propiedades."""
import django_filters

from .models import Property


class PropertyFilter(django_filters.FilterSet):
    location = django_filters.CharFilter(field_name="location__slug")
    amenities = django_filters.BaseInFilter(field_name="amenities__slug")
    guests = django_filters.NumberFilter(method="filter_capacity")
    min_price = django_filters.NumberFilter(
        field_name="price_per_night", lookup_expr="gte"
    )
    max_price = django_filters.NumberFilter(
        field_name="price_per_night", lookup_expr="lte"
    )
    featured = django_filters.BooleanFilter(field_name="is_featured")
    check_in = django_filters.DateFilter(method="noop")
    check_out = django_filters.DateFilter(method="noop")

    class Meta:
        model = Property
        fields = (
            "location",
            "amenities",
            "guests",
            "min_price",
            "max_price",
            "featured",
            "check_in",
            "check_out",
        )

    def filter_capacity(self, queryset, _name, value):
        if value is None:
            return queryset
        return queryset.filter(max_guests__gte=value)

    def noop(self, queryset, _name, _value):
        return queryset
