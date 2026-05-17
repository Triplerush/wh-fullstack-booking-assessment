"""Tests del endpoint de login."""
import pytest
from rest_framework.test import APIClient

from accounts.tests.factories import UserFactory

URL = "/api/v1/auth/login/"


@pytest.mark.django_db
def test_valid_credentials_return_tokens():
    UserFactory(email="login@example.com")
    response = APIClient().post(
        URL,
        {"email": "login@example.com", "password": "password1"},
        format="json",
    )
    assert response.status_code == 200, response.data
    assert "access" in response.data and response.data["access"]
    assert "refresh" in response.data and response.data["refresh"]


@pytest.mark.django_db
def test_invalid_credentials_return_401():
    UserFactory(email="login@example.com")
    response = APIClient().post(
        URL,
        {"email": "login@example.com", "password": "wrongpass"},
        format="json",
    )
    assert response.status_code == 401
