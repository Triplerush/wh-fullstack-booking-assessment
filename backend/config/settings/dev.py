"""Settings de desarrollo.

Reexporta cada nombre que define `base` y sobreescribe solo los que cambian en
desarrollo. Django lee los atributos del módulo apuntado por
DJANGO_SETTINGS_MODULE, así que cada setting debe vivir a nivel de módulo aquí.
"""
from .base import (
    ASGI_APPLICATION,
    AUTH_PASSWORD_VALIDATORS,
    AUTH_USER_MODEL,
    BASE_DIR,
    CORS_ALLOWED_ORIGINS,
    CSRF_TRUSTED_ORIGINS,
    DATABASES,
    DATABASE_URL,
    DEFAULT_AUTO_FIELD,
    DEFAULT_FROM_EMAIL,
    INSTALLED_APPS,
    LANGUAGE_CODE,
    MEDIA_ROOT,
    MEDIA_URL,
    MIDDLEWARE,
    REST_FRAMEWORK,
    ROOT_URLCONF,
    SECRET_KEY,
    STATIC_ROOT,
    STATIC_URL,
    TEMPLATES,
    TIME_ZONE,
    USE_I18N,
    USE_TZ,
    WSGI_APPLICATION,
)

DEBUG = True
ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
