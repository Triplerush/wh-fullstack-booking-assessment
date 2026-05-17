"""Tests del pipeline de optimización de imágenes."""
import io

import pytest
from PIL import Image

from common.imaging import optimize_image


def _png(width, height, color=(120, 80, 40)):
    img = Image.new("RGB", (width, height), color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def _webp(width, height, color=(200, 200, 200)):
    img = Image.new("RGB", (width, height), color)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=82, method=6)
    buf.seek(0)
    return buf


def test_png_2000x1500_becomes_webp_at_most_1200():
    src = _png(2000, 1500)
    out = optimize_image(src, "atico-malasana")

    out.seek(0)
    result = Image.open(out)
    assert result.format == "WEBP"
    longest = max(result.size)
    assert longest <= 1200, f"longest side {longest}"
    # se conserva la relación de aspecto
    assert abs(result.size[0] / result.size[1] - 2000 / 1500) < 0.01


def test_existing_small_webp_is_left_untouched():
    src = _webp(800, 600)
    src_bytes_in = src.getvalue()
    src.seek(0)

    out = optimize_image(src, "casa-pequena")

    out.seek(0)
    result = Image.open(out)
    assert result.format == "WEBP"
    assert result.size == (800, 600), "no upscale, no resize for small webp"


def test_small_image_is_not_upscaled():
    src = _png(400, 300)
    out = optimize_image(src, "thumb")

    out.seek(0)
    result = Image.open(out)
    assert result.format == "WEBP"
    assert result.size == (400, 300), "small images keep their size"
