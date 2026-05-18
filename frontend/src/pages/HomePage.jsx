import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getLocations } from "../api/catalog";
import { getProperties } from "../api/properties";
import { HeroSearch } from "../components/forms/HeroSearch";
import { PropertyCard } from "../components/property/PropertyCard";
import { PropertyCardSkeleton } from "../components/ui/Skeleton";

// Imagen del hero servida desde Unsplash con parámetros que pesan poco.
// Evoca el registro editorial del Figma sin depender de archivos locales.
const HERO_IMG =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=2000&q=72";

// Foto vertical para el bloque "Alquileres a largo plazo": ambiente de
// salón aireado, alineada con el registro visual del diseño de referencia.
const LONG_STAY_IMG =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=72";


export function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const locations = useQuery({
    queryKey: ["locations", lang],
    queryFn: getLocations,
    placeholderData: keepPreviousData,
  });
  const featured = useQuery({
    queryKey: ["properties", "featured", lang],
    queryFn: () => getProperties({ featured: "true" }),
    placeholderData: keepPreviousData,
  });

  const items = featured.data?.results ?? [];
  const locationsList = locations.data ?? [];

  return (
    <>
      <section className="hero" style={{ "--hero-image": `url(${HERO_IMG})` }}>
        <div className="hero-copy">
          <h1>
            {t("home.heroTitleA")} {t("home.heroTitleB")}
          </h1>
          <span className="hero-sub">{t("home.heroEyebrow")}</span>
        </div>
        <HeroSearch locations={locationsList} />
      </section>

      <section className="section section-tight">
        <div className="featured-split">
          <div className="featured-intro">
            <h2 className="display-lg">{t("home.featuredTitle")}</h2>
            <p>{t("home.featuredCopy")}</p>
          </div>
          <div>
            <div className="pill-row" style={{ justifyContent: "flex-start", marginBottom: 22 }}>
              <button type="button" className="pill active">
                {t("home.filterAll")}
              </button>
              <button type="button" className="pill">{t("home.filterCollection")}</button>
              <button type="button" className="pill">{t("home.filterCasa")}</button>
            </div>
            {featured.isPending ? (
              <div className="property-grid">
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
              </div>
            ) : featured.isError ? (
              <p>{t("common.errorLoading")}</p>
            ) : items.length === 0 ? (
              <p>{t("home.noFeatured")}</p>
            ) : (
              <div className="property-grid">
                {items.slice(0, 2).map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="why-spain">
          <div>
            <span className="eyebrow">{t("home.whyEyebrow")}</span>
            <h2>{t("home.whyTitle")}</h2>
          </div>
          <div className="why-cols">
            <div>
              <h3 className="display-md">{t("home.whyA.title")}</h3>
              <p>{t("home.whyA.body")}</p>
            </div>
            <div>
              <h3 className="display-md">{t("home.whyB.title")}</h3>
              <p>{t("home.whyB.body")}</p>
            </div>
            <div>
              <h3 className="display-md">{t("home.whyC.title")}</h3>
              <p>{t("home.whyC.body")}</p>
            </div>
            <div>
              <h3 className="display-md">{t("home.whyD.title")}</h3>
              <p>{t("home.whyD.body")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section long-stay">
        <div className="long-stay-image">
          <img src={LONG_STAY_IMG} alt="" loading="lazy" />
        </div>
        <div className="long-stay-copy">
          <h2>{t("home.ctaTitle")}</h2>
          <p>{t("home.ctaCopy")}</p>
          <a href="mailto:hola@wind-homes.test" className="btn">
            {t("home.ctaButton")}
          </a>
        </div>
      </section>
    </>
  );
}
