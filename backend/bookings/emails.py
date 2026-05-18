"""Envío del email de confirmación de reserva."""
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone

from .models import Booking

SUBJECTS = {
    "es": "Wind Homes · Tu reserva {code} está confirmada",
    "en": "Wind Homes · Booking {code} confirmed",
}


def send_booking_confirmation(booking_id: int) -> bool:
    """Renderiza y envía el email; marca `email_sent_at` de forma idempotente.

    Devuelve True si se envió en esta llamada, False si la reserva ya tenía
    `email_sent_at` (idempotencia) o si no estaba confirmada.
    """
    booking = (
        Booking.objects.select_related("property", "property__location", "user")
        .filter(id=booking_id)
        .first()
    )
    if booking is None:
        return False
    if booking.email_sent_at is not None:
        return False
    if booking.status != Booking._meta.get_field("status").default:
        return False

    lang = booking.language if booking.language in ("es", "en") else "es"
    property_title = (
        getattr(booking.property, f"title_{lang}", None)
        or booking.property.title_es
    )
    full_name = (booking.user.full_name or "").strip()
    if full_name:
        user_first_name = full_name.split(" ", 1)[0]
    else:
        user_first_name = booking.user.email.split("@", 1)[0]
    cover = (
        booking.property.images.filter(is_cover=True).first()
        or booking.property.images.order_by("order").first()
    )
    property_image_url = ""
    if cover and cover.image:
        property_image_url = cover.image.url
        if property_image_url.startswith("/"):
            base = getattr(settings, "SITE_URL", "").rstrip("/")
            if base:
                property_image_url = f"{base}{property_image_url}"
    context = {
        "booking": booking,
        "user_name": booking.user.full_name or booking.user.email,
        "user_first_name": user_first_name,
        "property_title": property_title,
        "property_address": booking.property.address,
        "property_image_url": property_image_url,
        "nights": booking.compute_nights(),
        "lang": lang,
    }
    subject = SUBJECTS[lang].format(code=booking.code)
    body_txt = render_to_string("emails/booking_confirmation.txt", context)
    body_html = render_to_string("emails/booking_confirmation.html", context)

    message = EmailMultiAlternatives(
        subject=subject,
        body=body_txt,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[booking.user.email],
    )
    message.attach_alternative(body_html, "text/html")
    message.send(fail_silently=False)

    Booking.objects.filter(id=booking.id).update(email_sent_at=timezone.now())
    return True


def schedule_send_on_commit(booking_id: int) -> None:
    """Programa el envío tras el commit de la transacción activa."""
    transaction.on_commit(lambda: send_booking_confirmation(booking_id))
