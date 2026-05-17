"""Validadores compartidos (regla de contraseña y formato de teléfono)."""
import re

from rest_framework import serializers

PHONE_COUNTRY_CODE_RE = re.compile(r"^\+\d{1,4}$")
PHONE_NUMBER_RE = re.compile(r"^\d{6,15}$")

_HAS_LETTER = re.compile(r"[A-Za-z]")
_HAS_DIGIT = re.compile(r"\d")


def password_letters_and_digits(value: str) -> None:
    """Contraseña: mínimo 8 caracteres, al menos una letra y un dígito."""
    if len(value) < 8:
        raise serializers.ValidationError(
            "Password must be at least 8 characters long."
        )
    if not _HAS_LETTER.search(value) or not _HAS_DIGIT.search(value):
        raise serializers.ValidationError(
            "Password must contain at least one letter and one digit."
        )


def validate_phone_country_code(value: str) -> None:
    if not PHONE_COUNTRY_CODE_RE.match(value):
        raise serializers.ValidationError(
            "Phone country code must look like '+34' (1–4 digits)."
        )


def validate_phone_number(value: str) -> None:
    if not PHONE_NUMBER_RE.match(value):
        raise serializers.ValidationError(
            "Phone number must be 6–15 digits."
        )
