from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def issue_tokens(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def register_user(validated_data: dict):
    password = validated_data.pop("password")
    user = User(**validated_data)
    user.set_password(password)
    user.save()
    return user
