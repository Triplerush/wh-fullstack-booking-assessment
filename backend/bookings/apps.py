from django.apps import AppConfig


class BookingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bookings"

    def ready(self):
        from .signals import schedule_confirmation_email

        assert callable(schedule_confirmation_email)
