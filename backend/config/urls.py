from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/", include("properties.urls")),
    path("api/v1/", include("bookings.urls")),
]

# Servimos /media tanto en dev como en prod: el nginx del frontend reenvía
# /media/* al backend, y aquí Django lo entrega desde MEDIA_ROOT (volumen
# docker en producción). Para tráfico bajo de portafolio es aceptable.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
