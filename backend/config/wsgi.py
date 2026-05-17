"""Configuración WSGI del proyecto.

Expone el callable WSGI como variable a nivel de módulo llamada ``application``.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.prod')

application = get_wsgi_application()
