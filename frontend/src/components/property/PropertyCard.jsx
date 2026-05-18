import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { formatPrice } from "../../utils/currency";

export function PropertyCard({ property }) {
  const { t, i18n } = useTranslation();
  const cover = property.cover_image;
  const capacity = property.capacity ?? property.max_guests ?? 0;
  return (
    <Link to={`/property/${property.slug}`} className="property-card">
      {cover ? (
        <img src={cover.url} alt={cover.alt || property.title} loading="lazy" />
      ) : null}
      <div className="property-info">
        <h3 className="property-title">{property.title}</h3>
        <span className="property-capacity">
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 6.4a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Zm0 .9c-1.9 0-5.4 1-5.4 3v1.2h10.8v-1.2c0-2-3.5-3-5.4-3Z" />
          </svg>
          {capacity || ""}
        </span>
        <p className="property-price">
          <strong>
            {formatPrice(property.price_per_night, property.currency, i18n.language)}
          </strong>
          <small>{t("catalog.night")}</small>
        </p>
        <span className="property-zone">
          {property.location?.name}
          {property.location?.country ? `, ${property.location.country}` : ""}
        </span>
      </div>
    </Link>
  );
}
