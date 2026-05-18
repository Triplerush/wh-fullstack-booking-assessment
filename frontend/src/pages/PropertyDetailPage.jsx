import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { getProperty } from "../api/properties";
import { StickyBookingCard } from "../components/booking/StickyBookingCard";
import { AmenityGrid } from "../components/property/AmenityGrid";
import { MapPlaceholder } from "../components/property/MapPlaceholder";
import { PropertyGallery } from "../components/property/PropertyGallery";
import { SkeletonLine } from "../components/ui/Skeleton";

function DetailSkeleton() {
  return (
    <div className="room-page" aria-hidden="true">
      <div className="container">
        <SkeletonLine width="40%" style={{ marginBottom: 14, marginTop: 18 }} />
      </div>
      <section className="horizontal-gallery container">
        <div className="gallery">
          <div className="gallery-main skel" />
          <div className="gallery-side">
            <div className="gallery-cell skel" />
            <div className="gallery-cell skel" />
          </div>
        </div>
      </section>
      <div className="container detail-body">
        <div className="detail-main">
          <SkeletonLine width="70%" style={{ height: 48, marginTop: 12 }} />
          <SkeletonLine width="40%" style={{ marginTop: 14 }} />
          <SkeletonLine width="55%" style={{ marginTop: 18 }} />
          <SkeletonLine width="90%" style={{ marginTop: 32 }} />
          <SkeletonLine width="85%" style={{ marginTop: 8 }} />
        </div>
        <div className="booking-box skel" style={{ minHeight: 380 }} />
      </div>
    </div>
  );
}

export function PropertyDetailPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const query = useQuery({
    queryKey: ["property", slug, lang],
    queryFn: () => getProperty(slug),
    placeholderData: keepPreviousData,
  });

  if (query.isPending) return <DetailSkeleton />;
  if (query.isError) {
    return (
      <div className="room-page">
        <div className="container" style={{ paddingTop: 40 }}>
          <p>{t("property.notFound")}</p>
          <Link to="/search" className="btn btn-outline" style={{ marginTop: 16 }}>
            {t("property.backToSearch")}
          </Link>
        </div>
      </div>
    );
  }
  const prop = query.data;

  return (
    <div className="room-page">
      <div className="container">
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link to="/">{t("nav.home")}</Link> /{" "}
          <Link to="/search">{t("nav.search")}</Link> /{" "}
          {prop.location?.name ? <span>{prop.location.name}</span> : null}
        </nav>
      </div>

      <section className="horizontal-gallery container">
        <PropertyGallery images={prop.images} />
      </section>

      <div className="container detail-body">
        <div className="detail-main">
          <h1 className="detail-title">{prop.title}</h1>
          <p className="room-neighboardhood">
            {prop.location?.name}
            {prop.location?.country ? `, ${prop.location.country}` : ""}
          </p>
          <div className="room-spaces">
            <span><strong>{prop.max_guests}</strong> {t("catalog.guests", { count: prop.max_guests })}</span>
            <span><strong>{prop.bedrooms}</strong> {t("catalog.bedrooms")}</span>
            <span><strong>{prop.bathrooms}</strong> {t("catalog.bathrooms")}</span>
          </div>

          <h3 className="detail-heading">{t("property.about")}</h3>
          <p className="detail-description">{prop.description}</p>

          <h3 className="detail-heading">{t("property.amenities")}</h3>
          <AmenityGrid amenities={prop.amenities} />

          <h3 className="detail-heading">{t("property.location")}</h3>
          <MapPlaceholder lat={prop.lat} lng={prop.lng} address={prop.address} />
        </div>

        <StickyBookingCard property={prop} />
      </div>
    </div>
  );
}
