import factory

from properties.models import Amenity, Location, Property, PropertyImage


class LocationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Location
        django_get_or_create = ("slug",)

    name_es = factory.Sequence(lambda n: f"Ciudad {n}")
    name_en = factory.Sequence(lambda n: f"City {n}")
    slug = factory.Sequence(lambda n: f"ciudad-{n}")
    country = "España"


class AmenityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Amenity
        django_get_or_create = ("slug",)

    name_es = factory.Sequence(lambda n: f"Amenidad {n}")
    name_en = factory.Sequence(lambda n: f"Amenity {n}")
    slug = factory.Sequence(lambda n: f"amenidad-{n}")
    icon = ""
    is_active = True
    order = 0


class PropertyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Property
        django_get_or_create = ("slug",)

    title_es = factory.Sequence(lambda n: f"Propiedad {n}")
    title_en = factory.Sequence(lambda n: f"Property {n}")
    slug = factory.Sequence(lambda n: f"propiedad-{n}")
    description_es = "Descripción"
    description_en = "Description"
    location = factory.SubFactory(LocationFactory)
    address = "Calle Falsa 123"
    lat = None
    lng = None
    max_guests = 4
    bedrooms = 2
    bathrooms = 1
    price_per_night = "100.00"
    currency = "USD"
    is_featured = False
    is_active = True


class PropertyImageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PropertyImage

    property = factory.SubFactory(PropertyFactory)
    image = ""
    alt_es = "Foto"
    alt_en = "Photo"
    order = 0
    is_cover = False
