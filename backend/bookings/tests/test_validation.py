"""Tests de validación de creación de reservas."""
from datetime import date, timedelta
from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from accounts.tests.factories import UserFactory
from bookings.tests.factories import BookingFactory
from properties.tests.factories import PropertyFactory

URL = "/api/v1/bookings/"


def _payload(prop, **overrides):
    base = {
        "property_id": prop.id,
        "check_in": str(date.today() + timedelta(days=10)),
        "check_out": str(date.today() + timedelta(days=15)),
        "guests": 2,
    }
    base.update(overrides)
    return base


def _client_for(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


@pytest.mark.django_db
def test_past_check_in_rejected():
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    user = UserFactory()
    body = _payload(prop, check_in=str(date.today() - timedelta(days=1)))
    resp = _client_for(user).post(URL, body, format="json")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_checkout_not_after_checkin_rejected():
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    user = UserFactory()
    today = date.today()
    body = _payload(
        prop,
        check_in=str(today + timedelta(days=5)),
        check_out=str(today + timedelta(days=5)),
    )
    resp = _client_for(user).post(URL, body, format="json")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_guests_zero_rejected():
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    user = UserFactory()
    resp = _client_for(user).post(URL, _payload(prop, guests=0), format="json")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_guests_over_capacity_rejected():
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    user = UserFactory()
    resp = _client_for(user).post(URL, _payload(prop, guests=5), format="json")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_overlap_rejected():
    prop = PropertyFactory(max_guests=4, price_per_night=Decimal("100.00"))
    other = UserFactory()
    BookingFactory(
        property=prop,
        user=other,
        check_in=date.today() + timedelta(days=12),
        check_out=date.today() + timedelta(days=14),
        status="confirmed",
    )
    user = UserFactory()
    resp = _client_for(user).post(URL, _payload(prop), format="json")
    assert resp.status_code == 400
    assert "non_field_errors" in resp.data
