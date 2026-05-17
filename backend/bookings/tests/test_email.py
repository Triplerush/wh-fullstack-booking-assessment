"""Tests del envío de email de confirmación de reserva."""
from datetime import date, timedelta
from decimal import Decimal

import pytest
from django.core import mail
from django.utils import timezone

from accounts.tests.factories import UserFactory
from bookings.emails import send_booking_confirmation
from bookings.services import create_booking
from properties.tests.factories import PropertyFactory


@pytest.mark.django_db(transaction=True)
def test_confirmed_creation_triggers_email():
    """Crear una reserva confirmada dispara el email tras el commit."""
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    user = UserFactory(email="recipient@example.com")
    mail.outbox = []

    booking = create_booking(
        user=user,
        property_id=prop.id,
        check_in=date.today() + timedelta(days=10),
        check_out=date.today() + timedelta(days=13),
        guests=2,
    )

    assert len(mail.outbox) == 1, [m.subject for m in mail.outbox]
    sent = mail.outbox[0]
    assert "recipient@example.com" in sent.to
    assert booking.code in sent.body or booking.code in sent.subject


@pytest.mark.django_db(transaction=True)
def test_email_sent_at_is_set_after_send():
    """`email_sent_at` se persiste tras el envío exitoso."""
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    user = UserFactory()

    booking = create_booking(
        user=user,
        property_id=prop.id,
        check_in=date.today() + timedelta(days=20),
        check_out=date.today() + timedelta(days=23),
        guests=2,
    )
    booking.refresh_from_db()
    assert booking.email_sent_at is not None
    assert (timezone.now() - booking.email_sent_at).total_seconds() < 60


@pytest.mark.django_db(transaction=True)
def test_email_not_sent_twice():
    """Llamar manualmente a `send_booking_confirmation` cuando ya fue enviado no reenvía."""
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    user = UserFactory()

    booking = create_booking(
        user=user,
        property_id=prop.id,
        check_in=date.today() + timedelta(days=30),
        check_out=date.today() + timedelta(days=33),
        guests=2,
    )
    assert len(mail.outbox) >= 1
    sent_count = len(mail.outbox)

    # Reintentar el envío explícito no debe duplicar el email.
    send_booking_confirmation(booking.id)

    assert len(mail.outbox) == sent_count
