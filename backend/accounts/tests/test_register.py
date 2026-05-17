import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from accounts.tests.factories import UserFactory

User = get_user_model()
URL = "/api/v1/auth/register/"


def _payload(**overrides):
    base = {
        "email": "new@example.com",
        "password": "password1",
        "full_name": "New User",
        "nationality": "España",
        "phone_country_code": "+34",
        "phone_number": "612345678",
        "birth_date": "1995-08-01",
    }
    base.update(overrides)
    return base


@pytest.mark.django_db
def test_valid_request_returns_tokens_and_user():
    response = APIClient().post(URL, _payload(), format="json")
    assert response.status_code == 201, response.data
    body = response.data
    assert "access" in body and body["access"]
    assert "refresh" in body and body["refresh"]
    user = body["user"]
    assert user["email"] == "new@example.com"
    assert user["full_name"] == "New User"
    assert user["nationality"] == "España"
    assert user["phone_country_code"] == "+34"
    assert user["phone_number"] == "612345678"
    assert user["birth_date"] == "1995-08-01"
    assert "password" not in user
    assert User.objects.filter(email="new@example.com").exists()


@pytest.mark.django_db
def test_duplicate_email_returns_400():
    UserFactory(email="dup@example.com")
    response = APIClient().post(URL, _payload(email="dup@example.com"), format="json")
    assert response.status_code == 400
    assert "email" in response.data


@pytest.mark.django_db
def test_password_without_digit_rejected():
    response = APIClient().post(URL, _payload(password="onlyletters"), format="json")
    assert response.status_code == 400
    assert "password" in response.data


@pytest.mark.django_db
def test_password_without_letter_rejected():
    response = APIClient().post(URL, _payload(password="12345678"), format="json")
    assert response.status_code == 400
    assert "password" in response.data


@pytest.mark.django_db
def test_password_shorter_than_8_rejected():
    response = APIClient().post(URL, _payload(password="abc1"), format="json")
    assert response.status_code == 400
    assert "password" in response.data


@pytest.mark.django_db
def test_phone_country_code_invalid_format_rejected():
    response = APIClient().post(URL, _payload(phone_country_code="34"), format="json")
    assert response.status_code == 400
    assert "phone_country_code" in response.data


@pytest.mark.django_db
def test_phone_number_invalid_format_rejected():
    response = APIClient().post(URL, _payload(phone_number="abc"), format="json")
    assert response.status_code == 400
    assert "phone_number" in response.data
