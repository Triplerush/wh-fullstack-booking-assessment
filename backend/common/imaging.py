"""Optimización de imágenes (WebP, lado largo máximo 1200 px, idempotente)."""
import io
from typing import BinaryIO

from django.core.files.base import ContentFile
from PIL import Image

MAX_SIDE = 1200
WEBP_QUALITY = 82
WEBP_METHOD = 6


def _read_source(file_like) -> Image.Image:
    """Acepta un FieldFile de Django, un UploadedFile o un BytesIO crudo."""
    if hasattr(file_like, "open"):
        try:
            file_like.open("rb")
        except (AttributeError, ValueError):
            pass
    if hasattr(file_like, "seek"):
        try:
            file_like.seek(0)
        except (OSError, ValueError):
            pass
    return Image.open(file_like)


def optimize_image(file_like: BinaryIO, slug: str) -> ContentFile:
    """Devuelve un `ContentFile` WebP en memoria llamado `<slug>.webp`.

    - Redimensiona al lado largo `MAX_SIDE` conservando la relación de aspecto.
    - No amplía nunca imágenes más pequeñas.
    - Reguardar una WebP ya pequeña conserva sus dimensiones (idempotente).
    """
    image = _read_source(file_like)
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")

    longest = max(image.size)
    if longest > MAX_SIDE:
        ratio = MAX_SIDE / float(longest)
        new_size = (round(image.size[0] * ratio), round(image.size[1] * ratio))
        image = image.resize(new_size, Image.LANCZOS)

    buf = io.BytesIO()
    save_kwargs = {"format": "WEBP", "quality": WEBP_QUALITY, "method": WEBP_METHOD}
    if image.mode == "RGBA":
        image.save(buf, **save_kwargs)
    else:
        image.save(buf, **save_kwargs)
    buf.seek(0)
    return ContentFile(buf.getvalue(), name=f"{slug}.webp")
