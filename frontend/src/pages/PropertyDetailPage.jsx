import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { getProperty } from "../api/properties";
import { StickyBookingCard } from "../components/booking/StickyBookingCard";
import { AmenityGrid } from "../components/property/AmenityGrid";
import { MapPlaceholder } from "../components/property/MapPlaceholder";
import { PropertyGallery } from "../components/property/PropertyGallery";

export function PropertyDetailPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const query = useQuery({
    queryKey: ["property", slug, lang],
    queryFn: () => getProperty(slug),
    placeholderData: keepPreviousData,
  });

  // `isPending` solo es true en la primera carga; al cambiar idioma se
  // mantiene la versión previa mientras llega la nueva, así no se desmonta
  // la StickyBookingCard y el form conserva su estado.
  if (query.isPending) return <p>{t("common.loading")}</p>;
  if (query.isError) {
    return (
      <div>
        <p>{t("property.notFound")}</p>
        <Link to="/search">{t("property.backToSearch")}</Link>
      </div>
    );
  }
  const prop = query.data;

  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
        gap: "var(--space-5)",
      }}
    >
      <div style={{ display: "grid", gap: "var(--space-5)" }}>
        <nav style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          <Link to="/">{t("nav.home")}</Link> ·{" "}
          <Link to="/search">{t("nav.search")}</Link> · {prop.title}
        </nav>
        <PropertyGallery images={prop.images} />
        <header>
          <h2>{prop.title}</h2>
          <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
            {prop.location?.name} · {prop.location?.country}
          </p>
        </header>
        <section>
          <h3>{t("property.about")}</h3>
          <p style={{ marginTop: "var(--space-2)" }}>{prop.description}</p>
        </section>
        <section>
          <h3>{t("property.capacity")}</h3>
          <p style={{ marginTop: "var(--space-2)" }}>
            {t("catalog.guests", { count: prop.max_guests })} · {prop.bedrooms}{" "}
            {t("catalog.bedrooms")} · {prop.bathrooms} {t("catalog.bathrooms")}
          </p>
        </section>
        <section>
          <h3>{t("property.amenities")}</h3>
          <div style={{ marginTop: "var(--space-3)" }}>
            <AmenityGrid amenities={prop.amenities} />
          </div>
        </section>
        <section>
          <h3>{t("property.location")}</h3>
          <div style={{ marginTop: "var(--space-3)" }}>
            <MapPlaceholder lat={prop.lat} lng={prop.lng} address={prop.address} />
          </div>
        </section>
      </div>
      <StickyBookingCard property={prop} />
    </article>
  );
}
