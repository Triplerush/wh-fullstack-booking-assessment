from django.db.models.signals import post_save
from django.dispatch import receiver

from .emails import schedule_send_on_commit
from .models import Booking, BookingStatus


@receiver(post_save, sender=Booking)
def schedule_confirmation_email(sender, instance: Booking, created: bool, **_kwargs):
    if not created:
        return
    if instance.status != BookingStatus.CONFIRMED:
        return
    if instance.email_sent_at is not None:
        return
    schedule_send_on_commit(instance.id)


__all__ = ["schedule_confirmation_email"]
