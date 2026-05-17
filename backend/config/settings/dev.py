"""Settings de desarrollo.

Reexporta cada nombre que define `base` y sobreescribe solo los que cambian en
desarrollo. Django lee los atributos del módulo apuntado por
DJANGO_SETTINGS_MODULE, así que cada setting debe vivir a nivel de módulo aquí.
"""
import os

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

# Proveedor de email en desarrollo: por defecto consola (imprime el email
# a stdout). Si en `.env` pones `EMAIL_PROVIDER=brevo` y `BREVO_API_KEY=…`,
# usa la API real de Brevo y manda correo de verdad — útil para probar el
# envío antes del deploy.
EMAIL_PROVIDER = os.environ.get("EMAIL_PROVIDER", "console").lower()

if EMAIL_PROVIDER == "brevo":
    EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"
    ANYMAIL = {"BREVO_API_KEY": os.environ.get("BREVO_API_KEY", "")}
elif EMAIL_PROVIDER == "smtp":
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True").lower() == "true"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
