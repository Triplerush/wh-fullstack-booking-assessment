"""Resolución de idioma y campo `LocalizedField` para serializadores."""
from rest_framework import serializers

SUPPORTED = ("es", "en")
DEFAULT = "es"


def get_language_from_request(request) -> str:
    """Resuelve el idioma: ?lang= → Accept-Language → es."""
    if request is None:
        return DEFAULT
    param = (getattr(request, "query_params", {}) or {}).get("lang")
    if param in SUPPORTED:
        return param
    accept = ""
    meta = getattr(request, "META", None)
    if isinstance(meta, dict):
        accept = meta.get("HTTP_ACCEPT_LANGUAGE", "") or ""
    if not accept:
        headers = getattr(request, "headers", None)
        if headers:
            accept = headers.get("Accept-Language", "") or ""
    for part in accept.split(","):
        code = part.split(";")[0].strip().lower()
        if not code:
            continue
        primary = code.split("-")[0]
        if primary in SUPPORTED:
            return primary
    return DEFAULT


class LocalizedField(serializers.Field):
    """Campo del serializador que elige `<base>_<lang>` (con `<base>_es` como respaldo)."""

    def __init__(self, base_name: str, **kwargs):
        self.base_name = base_name
        kwargs.setdefault("read_only", True)
        super().__init__(**kwargs)

    def to_representation(self, obj):
        request = self.context.get("request") if self.context else None
        lang = get_language_from_request(request)
        value = getattr(obj, f"{self.base_name}_{lang}", None)
        if value:
            return value
        return getattr(obj, f"{self.base_name}_{DEFAULT}", None)

    def get_attribute(self, instance):
        return instance
