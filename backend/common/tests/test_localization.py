"""Tests de resolución de idioma por petición."""
from types import SimpleNamespace

from common.localization import get_language_from_request


def _req(query_params=None, headers=None):
    return SimpleNamespace(
        query_params=query_params or {},
        META={"HTTP_ACCEPT_LANGUAGE": (headers or {}).get("Accept-Language", "")},
        headers=headers or {},
    )


def test_lang_param_beats_accept_language():
    req = _req(query_params={"lang": "en"}, headers={"Accept-Language": "es-ES,es;q=0.9"})
    assert get_language_from_request(req) == "en"


def test_accept_language_used_when_no_param():
    req = _req(headers={"Accept-Language": "en-US,en;q=0.9"})
    assert get_language_from_request(req) == "en"


def test_fallback_to_es_when_no_signal():
    req = _req()
    assert get_language_from_request(req) == "es"
