import io
import random
import socket
import time
import urllib.error
import urllib.request
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from PIL import Image, ImageDraw, ImageFont

from bookings.models import Booking
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


CURATED_PHOTOS = [
    # Lista curada de fotos públicas de Unsplash (CDN, sin auth requerido)
    # con temática casa/departamento/interior, alineada al producto. Cada
    # entrada es el `photo_id` que aparece en `https://images.unsplash.com/
    # photo-<id>`. Verificadas individualmente como accesibles. Si Unsplash
    # las retirara, el código cae a picsum y luego al placeholder PIL.
    "1560448204-e02f11c3d0e2",
    "1493809842364-78817add7ffb",
    "1556909114-f6e7ad7d3136",
    "1502672260266-1c1ef2d93688",
    "1505691938895-1758d7feb511",
    "1522708323590-d24dbb6b0267",
    "1484101403633-562f891dc89a",
    "1513584684374-8bab748fbf90",
    "1545324418-cc1a3fa10c00",
    "1554995207-c18c203602cb",
    "1507089947368-19c1da9775ae",
    "1540518614846-7eded433c457",
    "1494526585095-c41746248156",
    "1599809275671-b5942cabc7a2",
    "1564013799919-ab600027ffc6",
    "1502005229762-cf1b2da7c5d6",
    "1503174971373-b1f69850bded",
    "1567016432779-094069958ea5",
    "1571508601891-ca5e7a713859",
    "1631679706909-1844bbd07221",
    "1600585154340-be6161a56a0c",
    "1600210492486-724fe5c67fb0",
    "1600596542815-ffad4c1539a9",
    "1600607687939-ce8a6c25118c",
    "1600566753190-17f0baa2a6c3",
    "1600210491892-03d54c0aaf87",
    "1600585154526-990dced4db0d",
    "1502672023488-70e25813eb80",
    "1505693416388-ac5ce068fe85",
    "1493663284031-b7e3aefcae8e",
    "1495433324511-bf8e92934d90",
    "1586023492125-27b2c045efd7",
    "1556228720-195a672e8a03",
    "1567767292278-a4f21aa2d36e",
    "1598928506311-c55ded91a20c",
    "1605276374104-dee2a0ed3cd6",
    "1567538096630-e0c55bd6374c",
]


def _fetch_url(url: str, timeout: float, retries: int) -> bytes | None:
    """Helper genérico: descarga `url` con reintentos. Valida tamaño mínimo
    para descartar respuestas raras (errores HTML, redirects vacíos, etc).
    Envía un User-Agent de browser porque algunos CDNs (Unsplash en
    particular) rechazan o rate-limitan el UA por defecto de urllib.
    """
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
            ),
            "Accept": "image/jpeg,image/png,image/webp,image/*;q=0.8",
        },
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as resp:
                data = resp.read()
            if len(data) > 10_000:
                return data
        except (urllib.error.URLError, socket.timeout, TimeoutError):
            time.sleep(0.5 * (attempt + 1))
    return None


def _fetch_curated(seed: str, timeout: float = 15.0, retries: int = 4) -> bytes | None:
    """Toma una foto de la lista curada de Unsplash. El índice se deriva del
    hash MD5 del seed para que la selección sea determinista (misma foto en
    cada corrida) pero variada entre seeds distintos.
    """
    if not CURATED_PHOTOS:
        return None
    import hashlib

    idx = int(hashlib.md5(seed.encode()).hexdigest(), 16) % len(CURATED_PHOTOS)
    photo_id = CURATED_PHOTOS[idx]
    url = (
        f"https://images.unsplash.com/photo-{photo_id}"
        f"?w=1600&q=80&auto=format&fit=crop"
    )
    return _fetch_url(url, timeout, retries)


def _fetch_picsum(
    seed: str, timeout: float = 6.0, retries: int = 3
) -> bytes | None:
    """Foto genérica de picsum (fallback temático más débil)."""
    url = f"https://picsum.photos/seed/{seed}/1600/1200"
    return _fetch_url(url, timeout, retries)


def _make_placeholder_bytes(color_seed: int, label: str) -> bytes:
    """Placeholder plano con etiqueta centrada, usado solo si no hay red."""
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
    return buf.getvalue()


def _image_content(seed: str, color_seed: int, label: str) -> ContentFile:
    """Devuelve contenido de imagen para `seed`.

    Cascada de fuentes (de mejor a peor calidad temática):
      1. Lista curada de Unsplash (interiores de casas/departamentos).
      2. picsum.photos (fotos genéricas determinísticas).
      3. Placeholder PIL plano (color sólido con label).
    """
    data = _fetch_curated(seed)
    if data is not None:
        return ContentFile(data, name=f"{seed}.jpg")
    data = _fetch_picsum(seed)
    if data is not None:
        return ContentFile(data, name=f"{seed}.jpg")
    return ContentFile(_make_placeholder_bytes(color_seed, label), name="seed.png")


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
            # Reinicio total: borramos primero las reservas (FK PROTECT a
            # Property) y luego el catálogo. Sin --reset el comando solo
            # añade encima de lo existente.
            self.stdout.write("Resetting catalog tables...")
            bookings_count = Booking.objects.count()
            if bookings_count:
                self.stdout.write(f"  - Deleting {bookings_count} bookings (reset)")
                Booking.objects.all().delete()
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
        # Crea un superuser solo si no existe. La contraseña sale de
        # SEED_ADMIN_PASSWORD (env var); si no está, fija una inutilizable y
        # avisa para forzar al operador a definirla con `changepassword`.
        import os
        import secrets as _secrets

        User = get_user_model()
        email = os.environ.get("SEED_ADMIN_EMAIL", "admin@wh.test")
        admin, created = User.objects.get_or_create(
            email=email,
            defaults={"full_name": "Admin", "is_staff": True, "is_superuser": True},
        )
        if created:
            password = os.environ.get("SEED_ADMIN_PASSWORD")
            if password:
                admin.set_password(password)
                self.stdout.write(f"Created admin {email} (password from SEED_ADMIN_PASSWORD)")
            else:
                admin.set_password(_secrets.token_urlsafe(32))
                self.stdout.write(
                    f"Created admin {email} with random password. "
                    f"Run `manage.py changepassword {email}` antes de exponerlo."
                )
            admin.save()

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

            # 4 imágenes por propiedad; la primera es la portada. Cada seed
            # combina el slug y el índice para obtener fotos distintas pero
            # estables entre ejecuciones.
            prop.images.all().delete()
            for k in range(4):
                seed_token = f"{slug}-{k + 1}"
                content = _image_content(seed_token, i * 10 + k, f"{slug} {k + 1}")
                img = PropertyImage(
                    property=prop,
                    alt_es=f"Foto {k + 1} de {title_es}",
                    alt_en=f"Photo {k + 1} of {title_en}",
                    order=k,
                    is_cover=(k == 0),
                )
                img.image.save(content.name, content, save=False)
                img.save()
