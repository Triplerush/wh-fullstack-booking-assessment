"""Carga inicial de ubicaciones, amenidades, propiedades e imágenes de galería.

Uso:
  python manage.py seed_data --reset --properties 12

Las imágenes se generan al vuelo con Pillow (color plano + etiqueta) para
que el comando funcione sin conexión. Pasan por `PropertyImage.save()`,
que las optimiza a WebP al lado máximo configurado.
"""
import io
import random
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from PIL import Image, ImageDraw, ImageFont

from properties.models import Amenity, Location, Property, PropertyImage

LOCATIONS = [
    ("Madrid", "Madrid", "madrid", "España"),
    ("Barcelona", "Barcelona", "barcelona", "España"),
    ("Bogotá", "Bogotá", "bogota", "Colombia"),
    ("CDMX", "Mexico City", "cdmx", "México"),
    ("Lima", "Lima", "lima", "Perú"),
]

AMENITIES = [
    ("WiFi", "WiFi", "wifi", "wifi"),
    ("Piscina", "Pool", "pool", "pool"),
    ("Aire acondicionado", "Air conditioning", "ac", "ac"),
    ("Cocina equipada", "Equipped kitchen", "kitchen", "kitchen"),
    ("Estacionamiento", "Parking", "parking", "parking"),
    ("Lavadora", "Washer", "washer", "washer"),
    ("Calefacción", "Heating", "heating", "heating"),
    ("Terraza", "Terrace", "terrace", "terrace"),
]

PROP_TITLES = [
    ("Loft con vistas al centro", "Loft with downtown views"),
    ("Casa de campo familiar", "Family country house"),
    ("Apartamento boutique", "Boutique apartment"),
    ("Ático con terraza panorámica", "Penthouse with panoramic terrace"),
    ("Estudio cerca de la playa", "Studio near the beach"),
    ("Villa con piscina privada", "Villa with private pool"),
    ("Refugio en la montaña", "Mountain retreat"),
    ("Casa colonial restaurada", "Restored colonial house"),
    ("Dúplex moderno en zona rosa", "Modern duplex in pink zone"),
    ("Bungalow junto al río", "Bungalow by the river"),
    ("Penthouse de diseño", "Designer penthouse"),
    ("Cabaña con chimenea", "Cabin with fireplace"),
    ("Suite junto al malecón", "Suite by the boardwalk"),
    ("Loft industrial", "Industrial loft"),
    ("Casa de adobe", "Adobe house"),
]


def _make_image_bytes(color_seed: int, label: str) -> ContentFile:
    """Genera un PNG de 1600×1200 con un color plano y una etiqueta centrada."""
    rng = random.Random(color_seed)
    color = (rng.randint(40, 200), rng.randint(40, 200), rng.randint(40, 200))
    img = Image.new("RGB", (1600, 1200), color)
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 80)
    except OSError:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), label, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((1600 - tw) / 2, (1200 - th) / 2), label, fill=(255, 255, 255), font=font)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return ContentFile(buf.getvalue(), name="seed.png")


class Command(BaseCommand):
    help = "Seed catalog data (locations, amenities, properties with images)."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Truncate before seeding.")
        parser.add_argument(
            "--properties", type=int, default=12, help="Number of properties (default 12)."
        )

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts["reset"]:
            self.stdout.write("Resetting catalog tables...")
            PropertyImage.objects.all().delete()
            Property.objects.all().delete()
            Amenity.objects.all().delete()
            Location.objects.all().delete()

        self._ensure_admin()
        locations = self._seed_locations()
        amenities = self._seed_amenities()
        self._seed_properties(opts["properties"], locations, amenities)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {Location.objects.count()} locations, "
            f"{Amenity.objects.count()} amenities, "
            f"{Property.objects.count()} properties, "
            f"{PropertyImage.objects.count()} images."
        ))

    def _ensure_admin(self):
        User = get_user_model()
        admin, created = User.objects.get_or_create(
            email="admin@wh.test",
            defaults={"full_name": "Admin Demo", "is_staff": True, "is_superuser": True},
        )
        if created:
            admin.set_password("admin12345")
            admin.save()
            self.stdout.write("Created admin user admin@wh.test / admin12345")

    def _seed_locations(self):
        out = []
        for name_es, name_en, slug, country in LOCATIONS:
            loc, _ = Location.objects.update_or_create(
                slug=slug,
                defaults={"name_es": name_es, "name_en": name_en, "country": country},
            )
            out.append(loc)
        return out

    def _seed_amenities(self):
        out = []
        for i, (name_es, name_en, slug, icon) in enumerate(AMENITIES):
            am, _ = Amenity.objects.update_or_create(
                slug=slug,
                defaults={
                    "name_es": name_es,
                    "name_en": name_en,
                    "icon": icon,
                    "is_active": True,
                    "order": i,
                },
            )
            out.append(am)
        return out

    def _seed_properties(self, count, locations, amenities):
        rng = random.Random(42)
        for i in range(count):
            title_es, title_en = PROP_TITLES[i % len(PROP_TITLES)]
            title_es = f"{title_es} #{i + 1}"
            title_en = f"{title_en} #{i + 1}"
            slug = slugify(f"{title_en}")
            loc = locations[i % len(locations)]
            prop, _ = Property.objects.update_or_create(
                slug=slug,
                defaults={
                    "title_es": title_es,
                    "title_en": title_en,
                    "description_es": (
                        "Espacio cuidado al detalle, ideal para escapadas. "
                        "Buena conexión, luz natural y comodidades."
                    ),
                    "description_en": (
                        "A thoughtfully designed space, ideal for getaways. "
                        "Great connectivity, natural light and amenities."
                    ),
                    "location": loc,
                    "address": f"Calle Principal {100 + i}",
                    "lat": Decimal(str(round(rng.uniform(-12.5, 41.5), 6))),
                    "lng": Decimal(str(round(rng.uniform(-99.0, 2.5), 6))),
                    "max_guests": rng.choice([2, 3, 4, 6, 8]),
                    "bedrooms": rng.choice([1, 2, 3, 4]),
                    "bathrooms": rng.choice([1, 2, 3]),
                    "price_per_night": Decimal(str(rng.choice([45, 65, 90, 120, 180, 240, 320, 480]))),
                    "currency": "USD",
                    "is_featured": i < max(3, count // 3),
                    "is_active": True,
                },
            )
            prop.amenities.set(rng.sample(amenities, k=rng.randint(3, 6)))

            # 4 imágenes por propiedad; la primera es la portada
            prop.images.all().delete()
            for k in range(4):
                img = PropertyImage(
                    property=prop,
                    alt_es=f"Foto {k + 1} de {title_es}",
                    alt_en=f"Photo {k + 1} of {title_en}",
                    order=k,
                    is_cover=(k == 0),
                )
                img.image.save(
                    "seed.png",
                    _make_image_bytes(i * 10 + k, f"{slug} {k + 1}"),
                    save=False,
                )
                img.save()
