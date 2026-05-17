"""Smoke test: Django boots with the dev settings module."""
from django.conf import settings


def test_django_is_alive():
    assert settings.INSTALLED_APPS, "INSTALLED_APPS should not be empty"
    assert "accounts" in settings.INSTALLED_APPS
    assert settings.AUTH_USER_MODEL == "accounts.User"
