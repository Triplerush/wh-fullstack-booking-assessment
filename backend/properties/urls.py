from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AmenityListView, LocationListView, PropertyViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r"properties", PropertyViewSet, basename="properties")

urlpatterns = [
    path("locations/", LocationListView.as_view(), name="location-list"),
    path("amenities/", AmenityListView.as_view(), name="amenity-list"),
    path("", include(router.urls)),
]
