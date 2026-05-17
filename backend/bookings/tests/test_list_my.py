"""Tests del listado y detalle propios del usuario."""
import pytest
from rest_framework.test import APIClient

from accounts.tests.factories import UserFactory
from bookings.tests.factories import BookingFactory


@pytest.mark.django_db
def test_user_only_sees_own_bookings():
    mine = UserFactory()
    other = UserFactory()
    BookingFactory(user=mine, code="WH-20260516-AAAAAA")
    BookingFactory(user=other, code="WH-20260516-BBBBBB")
    BookingFactory(user=mine, code="WH-20260516-CCCCCC")

    client = APIClient()
    client.force_authenticate(user=mine)
    resp = client.get("/api/v1/bookings/")
    assert resp.status_code == 200
    body = resp.data["results"] if "results" in resp.data else resp.data
    codes = sorted(b["code"] for b in body)
    assert codes == ["WH-20260516-AAAAAA", "WH-20260516-CCCCCC"]


@pytest.mark.django_db
def test_404_when_not_owner():
    mine = UserFactory()
    other = UserFactory()
    booking = BookingFactory(user=other, code="WH-20260516-DDDDDD")

    client = APIClient()
    client.force_authenticate(user=mine)
    resp = client.get(f"/api/v1/bookings/{booking.id}/")
    assert resp.status_code == 404
