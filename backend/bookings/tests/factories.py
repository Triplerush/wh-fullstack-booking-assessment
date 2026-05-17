"""Factory de reservas para tests."""
from datetime import date, timedelta
from decimal import Decimal

import factory

from accounts.tests.factories import UserFactory
from bookings.models import Booking
from properties.tests.factories import PropertyFactory


class BookingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Booking

    code = factory.Sequence(lambda n: f"WH-20260516-{n:06X}")
    property = factory.SubFactory(PropertyFactory)
    user = factory.SubFactory(UserFactory)
    check_in = factory.LazyFunction(lambda: date.today() + timedelta(days=7))
    check_out = factory.LazyFunction(lambda: date.today() + timedelta(days=10))
    guests = 2
    total_price = Decimal("300.00")
    currency = "USD"
    status = "confirmed"
