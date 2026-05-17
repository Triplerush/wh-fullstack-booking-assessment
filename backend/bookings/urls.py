from rest_framework.routers import DefaultRouter

from .views import BookingViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r"bookings", BookingViewSet, basename="bookings")

urlpatterns = router.urls
