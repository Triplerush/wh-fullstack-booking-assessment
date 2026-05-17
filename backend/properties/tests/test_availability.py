"""Tests del endpoint POST /properties/<slug>/check-availability/."""
from datetime import date, timedelta
from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from bookings.tests.factories import BookingFactory
from properties.tests.factories import PropertyFactory


def _url(slug):
    return f"/api/v1/properties/{slug}/check-availability/"


def _payload(days_from_today=10, nights=3, guests=2):
    return {
        "check_in": str(date.today() + timedelta(days=days_from_today)),
        "check_out": str(date.today() + timedelta(days=days_from_today + nights)),
        "guests": guests,
    }


@pytest.mark.django_db
def test_ok_when_no_overlap():
    prop = PropertyFactory(
        slug="free", max_guests=4, price_per_night=Decimal("100.00")
    )
    resp = APIClient().post(_url("free"), _payload(nights=3), format="json")
    assert resp.status_code == 200
    assert resp.data["available"] is True
    assert resp.data["nights"] == 3
    assert Decimal(resp.data["total_price"]) == Decimal("300.00")
    assert resp.data["currency"] == "USD"


@pytest.mark.django_db
def test_ko_when_confirmed_overlaps():
    prop = PropertyFactory(
        slug="busy", max_guests=4, price_per_night=Decimal("100.00")
    )
    BookingFactory(
        property=prop,
        check_in=date.today() + timedelta(days=11),
        check_out=date.today() + timedelta(days=14),
        status="confirmed",
    )
    resp = APIClient().post(_url("busy"), _payload(days_from_today=10, nights=3), format="json")
    assert resp.status_code == 200
    assert resp.data["available"] is False
    assert "non_field_errors" in resp.data["errors"]


@pytest.mark.django_db
def test_ko_when_pending_overlaps():
    prop = PropertyFactory(
        slug="pending-block", max_guests=4, price_per_night=Decimal("100.00")
    )
    BookingFactory(
        property=prop,
        check_in=date.today() + timedelta(days=10),
        check_out=date.today() + timedelta(days=13),
        status="pending",
    )
    resp = APIClient().post(_url("pending-block"), _payload(days_from_today=11, nights=2), format="json")
    assert resp.status_code == 200
    assert resp.data["available"] is False


@pytest.mark.django_db
def test_ok_when_cancelled_overlaps():
    prop = PropertyFactory(
        slug="cancelled", max_guests=4, price_per_night=Decimal("100.00")
    )
    BookingFactory(
        property=prop,
        check_in=date.today() + timedelta(days=10),
        check_out=date.today() + timedelta(days=13),
        status="cancelled",
    )
    resp = APIClient().post(_url("cancelled"), _payload(days_from_today=11, nights=2), format="json")
    assert resp.status_code == 200
    assert resp.data["available"] is True


@pytest.mark.django_db
def test_adjacent_dates_are_ok():
    prop = PropertyFactory(
        slug="adjacent", max_guests=4, price_per_night=Decimal("100.00")
    )
    # Reserva del día 10 al 13 (check-out exclusivo).
    BookingFactory(
        property=prop,
        check_in=date.today() + timedelta(days=10),
        check_out=date.today() + timedelta(days=13),
        status="confirmed",
    )
    # Nueva reserva que arranca exactamente el 13: NO se solapa.
    resp = APIClient().post(_url("adjacent"), _payload(days_from_today=13, nights=2), format="json")
    assert resp.status_code == 200
    assert resp.data["available"] is True
