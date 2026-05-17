import factory
from django.contrib.auth import get_user_model

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("email",)

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    full_name = factory.Faker("name")
    nationality = "España"
    phone_country_code = "+34"
    phone_number = "612345678"
    birth_date = "1995-08-01"
    password = factory.PostGenerationMethodCall("set_password", "password1")
