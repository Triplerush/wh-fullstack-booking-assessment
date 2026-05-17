"""Configuración ASGI del proyecto.

Expone el callable ASGI como variable a nivel de módulo llamada ``application``.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.prod')

application = get_asgi_application()
