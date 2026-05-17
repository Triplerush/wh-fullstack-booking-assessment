from django.contrib import admin

from .models import Amenity, Location, Property, PropertyImage


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name_es", "name_en", "slug", "country")
    list_filter = ("country",)
    search_fields = ("name_es", "name_en", "slug")
    prepopulated_fields = {"slug": ("name_es",)}


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ("name_es", "slug", "icon", "is_active", "order")
    list_filter = ("is_active",)
    search_fields = ("name_es", "name_en", "slug")
    list_editable = ("order", "is_active")
    prepopulated_fields = {"slug": ("name_es",)}


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ("image", "alt_es", "alt_en", "order", "is_cover")


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "title_es",
        "location",
        "price_per_night",
        "currency",
        "max_guests",
        "is_featured",
        "is_active",
    )
    list_filter = ("is_featured", "is_active", "location", "currency")
    search_fields = ("title_es", "title_en", "slug", "address")
    prepopulated_fields = {"slug": ("title_es",)}
    filter_horizontal = ("amenities",)
    inlines = [PropertyImageInline]
    fieldsets = (
        (None, {"fields": ("title_es", "title_en", "slug")}),
        ("Descripción", {"fields": ("description_es", "description_en")}),
        ("Ubicación", {"fields": ("location", "address", "lat", "lng")}),
        ("Capacidad", {"fields": ("max_guests", "bedrooms", "bathrooms")}),
        ("Precio", {"fields": ("price_per_night", "currency")}),
        ("Estado", {"fields": ("is_featured", "is_active")}),
        ("Amenidades", {"fields": ("amenities",)}),
    )


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ("property", "order", "is_cover", "alt_es")
    list_filter = ("is_cover",)
    list_select_related = ("property",)
    search_fields = ("property__slug", "alt_es", "alt_en")
