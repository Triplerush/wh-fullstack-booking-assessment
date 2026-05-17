"""Tests de GET /properties/<slug>/."""
import pytest
from rest_framework.test import APIClient

from properties.tests.factories import (
    AmenityFactory,
    PropertyFactory,
    PropertyImageFactory,
)


def _url(slug):
    return f"/api/v1/properties/{slug}/"


@pytest.mark.django_db
def test_404_when_inactive():
    PropertyFactory(slug="hidden", is_active=False)
    resp = APIClient().get(_url("hidden"))
    assert resp.status_code == 404


@pytest.mark.django_db
def test_returns_images_in_order():
    prop = PropertyFactory(slug="gallery")
    PropertyImageFactory(property=prop, order=2, alt_es="B")
    PropertyImageFactory(property=prop, order=1, alt_es="A")
    PropertyImageFactory(property=prop, order=3, alt_es="C")
    resp = APIClient().get(_url("gallery"))
    assert resp.status_code == 200
    alts = [img["alt"] for img in resp.data["images"]]
    assert alts == ["A", "B", "C"]


@pytest.mark.django_db
def test_returns_amenities():
    prop = PropertyFactory(slug="loaded")
    wifi = AmenityFactory(slug="wifi", name_es="WiFi", name_en="WiFi")
    pool = AmenityFactory(slug="pool", name_es="Piscina", name_en="Pool")
    prop.amenities.add(wifi, pool)

    resp = APIClient().get(_url("loaded"))
    assert resp.status_code == 200
    slugs = sorted(a["slug"] for a in resp.data["amenities"])
    assert slugs == ["pool", "wifi"]
