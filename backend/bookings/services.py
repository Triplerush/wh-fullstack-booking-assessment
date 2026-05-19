import secrets
from datetime import date, datetime, timezone
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.utils import timezone as django_timezone
from rest_framework import serializers

from properties.models import Property

from .models import Booking, BookingStatus

ACTIVE_STATUSES = (BookingStatus.PENDING, BookingStatus.CONFIRMED)


def generate_code(when: datetime | None = None) -> str:
    """Genera `WH-YYYYMMDD-XXXXXX` (XXXXXX = 6 hex en mayúsculas)."""
    moment = when or django_timezone.now()
    suffix = secrets.token_hex(3).upper()
    return f"WH-{moment.strftime('%Y%m%d')}-{suffix}"


def compute_total(prop: Property, check_in: date, check_out: date) -> Decimal:
    nights = (check_out - check_in).days
    if nights <= 0:
        return Decimal("0.00")
    return (prop.price_per_night * nights).quantize(Decimal("0.01"))


def _has_overlap(prop: Property, check_in: date, check_out: date, *, lock: bool = False) -> bool:
    qs = Booking.objects.filter(
        property=prop,
        status__in=ACTIVE_STATUSES,
        check_in__lt=check_out,
        check_out__gt=check_in,
    )
    if lock:
        qs = qs.select_for_update()
    return qs.exists()


def validate_booking_request(prop: Property, *, check_in: date, check_out: date, guests: int) -> None:
    """Valida las reglas de negocio comunes a reserva y comprobación de disponibilidad.

    Lanza `serializers.ValidationError` con la forma estándar de DRF para que
    las vistas la traduzcan a 400 / `errors` automáticamente.
    """
    errors = {}
    today = django_timezone.localdate()
    if check_in < today:
        errors.setdefault("check_in", []).append("check_in_in_past")
    if check_out <= check_in:
        errors.setdefault("check_out", []).append("check_out_not_after_check_in")
    if guests is None or guests <= 0:
        errors.setdefault("guests", []).append("guests_must_be_positive")
    elif guests > prop.max_guests:
        errors.setdefault("guests", []).append(
            f"guests_exceeds_capacity:{prop.max_guests}"
        )

    if errors:
        raise serializers.ValidationError(errors)

    if _has_overlap(prop, check_in, check_out):
        raise serializers.ValidationError(
            {"non_field_errors": ["dates_unavailable"]}
        )


def create_booking(
    *,
    user,
    property_id: int,
    check_in: date,
    check_out: date,
    guests: int,
    language: str = "es",
) -> Booking:
    """Crea la reserva dentro de una transacción atómica con bloqueo de filas."""
    with transaction.atomic():
        try:
            prop = Property.objects.select_for_update().get(id=property_id, is_active=True)
        except Property.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"property_id": ["property_inactive"]}
            ) from exc

        if _has_overlap(prop, check_in, check_out, lock=True):
            raise serializers.ValidationError(
                {"non_field_errors": ["dates_unavailable"]}
            )
        validate_booking_request(
            prop, check_in=check_in, check_out=check_out, guests=guests
        )

        total = compute_total(prop, check_in, check_out)
        for _attempt in range(2):
            code = generate_code()
            try:
                with transaction.atomic():
                    return Booking.objects.create(
                        code=code,
                        property=prop,
                        user=user,
                        check_in=check_in,
                        check_out=check_out,
                        guests=guests,
                        total_price=total,
                        currency=prop.currency,
                        status=BookingStatus.CONFIRMED,
                        language=language if language in ("es", "en") else "es",
                    )
            except IntegrityError as exc:
                if _attempt == 1:
                    raise serializers.ValidationError(
                        {"non_field_errors": ["dates_unavailable"]}
                    ) from exc
                continue
        raise RuntimeError("unreachable")
