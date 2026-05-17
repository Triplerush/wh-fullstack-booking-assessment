"""Tests del endpoint /auth/me/."""
import pytest
from rest_framework.test import APIClient

from accounts.tests.factories import UserFactory

URL = "/api/v1/auth/me/"


@pytest.mark.django_db
def test_authenticated_user_returns_profile():
    user = UserFactory(email="me@example.com", full_name="Me User")
    client = APIClient()
    client.force_authenticate(user=user)
    response = client.get(URL)
    assert response.status_code == 200, response.data
    body = response.data
    assert body["email"] == "me@example.com"
    assert body["full_name"] == "Me User"
    assert "password" not in body


@pytest.mark.django_db
def test_unauthenticated_returns_401():
    response = APIClient().get(URL)
    assert response.status_code == 401
