import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { formatPrice } from "../../utils/currency";

export function PropertyCard({ property }) {
  const { t, i18n } = useTranslation();
  const cover = property.cover_image;
  return (
    <Link
      to={`/property/${property.slug}`}
      style={{
        display: "block",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          aspectRatio: "4 / 3",
          background: "var(--color-surface-alt)",
        }}
      >
        {cover ? (
          <img
            src={cover.url}
            alt={cover.alt || property.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : null}
      </div>
      <div style={{ padding: "var(--space-3) var(--space-4)" }}>
        <h3 style={{ fontSize: "1.05rem", marginBottom: "var(--space-1)" }}>
          {property.title}
        </h3>
        <p
          style={{
            margin: 0,
            color: "var(--color-text-muted)",
            fontSize: "0.85rem",
          }}
        >
          {property.location?.name} · {property.location?.country}
        </p>
        <p style={{ margin: "var(--space-2) 0 0", fontWeight: 600 }}>
          {formatPrice(property.price_per_night, property.currency, i18n.language)}{" "}
          <span style={{ fontWeight: 400, color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
            / {t("catalog.night")}
          </span>
        </p>
        <p
          style={{
            margin: "var(--space-2) 0 0",
            fontSize: "0.8rem",
            color: "var(--color-text-muted)",
          }}
        >
          {t("catalog.guests", { count: property.max_guests })} · {property.bedrooms} {t("catalog.bedrooms")} · {property.bathrooms} {t("catalog.bathrooms")}
        </p>
      </div>
    </Link>
  );
}
