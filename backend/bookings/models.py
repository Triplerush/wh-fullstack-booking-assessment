"""Modelo de reserva (raíz del agregado bookings)."""
from django.conf import settings
from django.db import models


class BookingStatus(models.TextChoices):
    PENDING = "pending", "Pendiente"
    CONFIRMED = "confirmed", "Confirmada"
    CANCELLED = "cancelled", "Cancelada"


class Booking(models.Model):
    code = models.CharField(max_length=24, unique=True)
    property = models.ForeignKey(
        "properties.Property", on_delete=models.PROTECT, related_name="bookings"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="bookings"
    )
    check_in = models.DateField()
    check_out = models.DateField()
    guests = models.PositiveSmallIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    status = models.CharField(
        max_length=16, choices=BookingStatus.choices, default=BookingStatus.CONFIRMED
    )
    email_sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.CheckConstraint(
                check=models.Q(check_in__lt=models.F("check_out")),
                name="bk_check_in_before_check_out",
            ),
            models.CheckConstraint(
                check=models.Q(guests__gt=0), name="bk_guests_positive"
            ),
            models.CheckConstraint(
                check=models.Q(total_price__gte=0), name="bk_total_non_negative"
            ),
        ]
        indexes = [
            models.Index(fields=["property", "check_in", "check_out"]),
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return self.code

    def compute_nights(self) -> int:
        return (self.check_out - self.check_in).days
