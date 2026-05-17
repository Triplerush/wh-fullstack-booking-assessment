import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { getLocations } from "../api/catalog";
import { getProperties } from "../api/properties";
import { HeroSearch } from "../components/forms/HeroSearch";
import { PropertyCard } from "../components/property/PropertyCard";

export function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const locations = useQuery({
    queryKey: ["locations", lang],
    queryFn: getLocations,
  });
  const featured = useQuery({
    queryKey: ["properties", "featured", lang],
    queryFn: () => getProperties({ featured: "true" }),
  });

  const items = featured.data?.results ?? [];

  return (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <section>
        <h2 style={{ marginBottom: "var(--space-4)" }}>{t("home.title")}</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-5)" }}>
          {t("home.subtitle")}
        </p>
        <HeroSearch locations={locations.data ?? []} />
      </section>

      <section>
        <h3 style={{ marginBottom: "var(--space-4)" }}>{t("home.featured")}</h3>
        {featured.isLoading ? (
          <p>{t("common.loading")}</p>
        ) : featured.isError ? (
          <p>{t("common.errorLoading")}</p>
        ) : items.length === 0 ? (
          <p>{t("home.noFeatured")}</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {items.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
