from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "property",
        "user",
        "check_in",
        "check_out",
        "guests",
        "status",
        "total_price",
        "email_sent_at",
    )
    list_filter = ("status", "currency", "property__location")
    search_fields = ("code", "user__email", "property__slug")
    list_select_related = ("property", "user")
    readonly_fields = (
        "code",
        "total_price",
        "currency",
        "email_sent_at",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        (None, {"fields": ("code", "status")}),
        ("Reserva", {"fields": ("property", "user", "check_in", "check_out", "guests")}),
        ("Importe", {"fields": ("total_price", "currency")}),
        ("Auditoría", {"fields": ("email_sent_at", "created_at", "updated_at")}),
    )
