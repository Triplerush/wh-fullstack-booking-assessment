from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from common.validators import (
    password_letters_and_digits,
    validate_phone_country_code,
    validate_phone_number,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "nationality",
            "phone_country_code",
            "phone_number",
            "birth_date",
        )
        read_only_fields = ("id",)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "full_name",
            "nationality",
            "phone_country_code",
            "phone_number",
            "birth_date",
        )
        extra_kwargs = {
            "email": {"required": True},
            "full_name": {"required": True, "allow_blank": False},
            "nationality": {"required": True, "allow_blank": False},
            "phone_country_code": {"required": True, "allow_blank": False},
            "phone_number": {"required": True, "allow_blank": False},
            "birth_date": {"required": True},
        }

    def validate_email(self, value: str) -> str:
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("This email is already registered.")
        return normalized

    def validate_password(self, value: str) -> str:
        password_letters_and_digits(value)
        return value

    def validate_phone_country_code(self, value: str) -> str:
        validate_phone_country_code(value)
        return value

    def validate_phone_number(self, value: str) -> str:
        validate_phone_number(value)
        return value


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login serializer using email-as-username"""

    username_field = User.USERNAME_FIELD