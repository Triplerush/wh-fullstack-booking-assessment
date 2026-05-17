"""Iter-1 test: logout blacklists the refresh token."""
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.tests.factories import UserFactory

LOGOUT_URL = "/api/v1/auth/logout/"
REFRESH_URL = "/api/v1/auth/refresh/"


@pytest.mark.django_db
def test_logout_blacklists_refresh_token():
    user = UserFactory(email="logout@example.com")
    refresh = str(RefreshToken.for_user(user))

    client = APIClient()
    client.force_authenticate(user=user)
    response = client.post(LOGOUT_URL, {"refresh": refresh}, format="json")
    assert response.status_code == 205, response.data

    # Using the same refresh after logout must fail.
    anon = APIClient()
    refresh_response = anon.post(REFRESH_URL, {"refresh": refresh}, format="json")
    assert refresh_response.status_code == 401
