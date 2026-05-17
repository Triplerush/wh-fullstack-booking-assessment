"""Settings de producción.

Mismo patrón que `dev`: reexporta cada nombre definido en `base` y sobreescribe.
"""
import os

from .base import (
    ASGI_APPLICATION,
    ALLOWED_HOSTS,
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

DEBUG = False
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Proveedor de email: "brevo" (API), "smtp" o "console".
EMAIL_PROVIDER = os.environ.get("EMAIL_PROVIDER", "brevo").lower()

if EMAIL_PROVIDER == "brevo":
    # Vía API HTTPS — recomendado en DigitalOcean (los puertos 25/465/587
    # están bloqueados por defecto). Usa django-anymail con backend Brevo.
    EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"
    ANYMAIL = {
        "BREVO_API_KEY": os.environ.get("BREVO_API_KEY", ""),
        # Opcional: dominio/IP de envío configurada en Brevo, sender id, etc.
    }
elif EMAIL_PROVIDER == "console":
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = os.environ.get(
        "EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend"
    )
    EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True").lower() == "true"
