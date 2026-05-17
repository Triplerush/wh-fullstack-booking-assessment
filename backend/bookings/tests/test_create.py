"""Tests de creación de reservas."""
import threading
from datetime import date, timedelta
from decimal import Decimal

import pytest
from django import db as django_db
from rest_framework.test import APIClient

from accounts.tests.factories import UserFactory
from bookings.models import Booking
from properties.tests.factories import PropertyFactory

URL = "/api/v1/bookings/"


def _payload(prop, days_from_today=10, nights=5, guests=2):
    return {
        "property_id": prop.id,
        "check_in": str(date.today() + timedelta(days=days_from_today)),
        "check_out": str(date.today() + timedelta(days=days_from_today + nights)),
        "guests": guests,
    }


def _client_for(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


@pytest.mark.django_db
def test_computes_total_correctly():
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("120.00"))
    user = UserFactory()
    resp = _client_for(user).post(URL, _payload(prop, nights=5), format="json")
    assert resp.status_code == 201, resp.data
    assert Decimal(resp.data["total_price"]) == Decimal("600.00")
    assert resp.data["nights"] == 5


@pytest.mark.django_db
def test_generates_unique_code():
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    user = UserFactory()
    resp = _client_for(user).post(URL, _payload(prop), format="json")
    assert resp.status_code == 201
    code = resp.data["code"]
    assert code.startswith("WH-")
    parts = code.split("-")
    assert len(parts) == 3
    assert len(parts[1]) == 8 and parts[1].isdigit()
    assert len(parts[2]) == 6 and all(c in "0123456789ABCDEF" for c in parts[2])
    assert Booking.objects.filter(code=code).count() == 1


@pytest.mark.django_db
def test_status_is_confirmed():
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    user = UserFactory()
    resp = _client_for(user).post(URL, _payload(prop), format="json")
    assert resp.data["status"] == "confirmed"


@pytest.mark.django_db
def test_owner_is_request_user():
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    user = UserFactory(email="owner@example.com")
    resp = _client_for(user).post(URL, _payload(prop), format="json")
    booking = Booking.objects.get(id=resp.data["id"])
    assert booking.user_id == user.id


@pytest.mark.django_db(transaction=True)
def test_concurrent_creates_only_one_succeeds():
    """Dos clientes en paralelo intentan reservar las mismas fechas; solo una gana."""
    prop = PropertyFactory(
        slug="concurrent-prop", max_guests=4, price_per_night=Decimal("100.00")
    )
    u1 = UserFactory(email="c1@example.com")
    u2 = UserFactory(email="c2@example.com")
    body = _payload(prop, days_from_today=20, nights=3)

    results = []
    barrier = threading.Barrier(2)

    def make_booking(user):
        try:
            barrier.wait()
            client = APIClient()
            client.force_authenticate(user=user)
            resp = client.post(URL, body, format="json")
            results.append(resp.status_code)
        finally:
            django_db.connections.close_all()

    threads = [
        threading.Thread(target=make_booking, args=(u1,)),
        threading.Thread(target=make_booking, args=(u2,)),
    ]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    successes = [s for s in results if s == 201]
    failures = [s for s in results if s == 400]
    assert len(successes) == 1, f"expected 1 success, got {results}"
    assert len(failures) == 1, f"expected 1 rejection, got {results}"
    assert Booking.objects.filter(property=prop, status="confirmed").count() == 1
