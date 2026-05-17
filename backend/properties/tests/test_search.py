"""Tests de GET /properties/: búsqueda, filtros y localización."""
import pytest
from rest_framework.test import APIClient

from properties.tests.factories import LocationFactory, PropertyFactory

URL = "/api/v1/properties/"


def _results(resp):
    body = resp.data
    return body["results"] if isinstance(body, dict) and "results" in body else body


@pytest.mark.django_db
def test_lists_only_active():
    PropertyFactory(slug="active-1", is_active=True)
    PropertyFactory(slug="inactive-1", is_active=False)
    resp = APIClient().get(URL)
    assert resp.status_code == 200
    slugs = [p["slug"] for p in _results(resp)]
    assert "active-1" in slugs
    assert "inactive-1" not in slugs


@pytest.mark.django_db
def test_filters_by_location_slug():
    madrid = LocationFactory(slug="madrid")
    bogota = LocationFactory(slug="bogota")
    PropertyFactory(slug="p-mad", location=madrid)
    PropertyFactory(slug="p-bog", location=bogota)
    resp = APIClient().get(URL, {"location": "madrid"})
    slugs = [p["slug"] for p in _results(resp)]
    assert slugs == ["p-mad"]


@pytest.mark.django_db
def test_filters_by_guest_capacity():
    PropertyFactory(slug="small", max_guests=2)
    PropertyFactory(slug="medium", max_guests=6)
    PropertyFactory(slug="big", max_guests=12)
    resp = APIClient().get(URL, {"guests": 5})
    slugs = sorted(p["slug"] for p in _results(resp))
    assert slugs == ["big", "medium"]


@pytest.mark.django_db
def test_filters_by_min_and_max_price():
    PropertyFactory(slug="cheap", price_per_night="40.00")
    PropertyFactory(slug="mid", price_per_night="120.00")
    PropertyFactory(slug="lux", price_per_night="500.00")
    resp = APIClient().get(URL, {"min_price": 50, "max_price": 300})
    slugs = sorted(p["slug"] for p in _results(resp))
    assert slugs == ["mid"]


@pytest.mark.django_db
def test_filters_featured_true():
    PropertyFactory(slug="reg", is_featured=False)
    PropertyFactory(slug="star", is_featured=True)
    resp = APIClient().get(URL, {"featured": "true"})
    slugs = [p["slug"] for p in _results(resp)]
    assert slugs == ["star"]


@pytest.mark.django_db
def test_returns_localized_title_es_default():
    PropertyFactory(slug="loc-es", title_es="Casa en Madrid", title_en="House in Madrid")
    resp = APIClient().get(URL)
    item = next(p for p in _results(resp) if p["slug"] == "loc-es")
    assert item["title"] == "Casa en Madrid"


@pytest.mark.django_db
def test_returns_localized_title_en_when_lang_en():
    PropertyFactory(slug="loc-en", title_es="Casa en Madrid", title_en="House in Madrid")
    resp = APIClient().get(URL, {"lang": "en"})
    item = next(p for p in _results(resp) if p["slug"] == "loc-en")
    assert item["title"] == "House in Madrid"
