import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { getLocations } from "../api/catalog";
import { getProperties } from "../api/properties";
import { HeroSearch } from "../components/forms/HeroSearch";
import { PropertyCard } from "../components/property/PropertyCard";

export function SearchPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const lang = i18n.language;

  const filters = useMemo(() => {
    const obj = {};
    for (const [k, v] of params.entries()) {
      if (v) obj[k] = v;
    }
    return obj;
  }, [params]);

  const locations = useQuery({
    queryKey: ["locations", lang],
    queryFn: getLocations,
  });

  const search = useQuery({
    queryKey: ["properties", "search", lang, filters],
    queryFn: () => getProperties(filters),
    placeholderData: keepPreviousData,
  });

  const items = search.data?.results ?? [];
  const count = search.data?.count ?? 0;
  const page = Number(params.get("page") ?? 1);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  function goToPage(p) {
    const next = new URLSearchParams(params);
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    setParams(next, { replace: false });
  }

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <HeroSearch locations={locations.data ?? []} compact />

      <p style={{ color: "var(--color-text-muted)" }}>
        {t("search.resultsCount", { count })}
      </p>

      {search.isLoading ? (
        <p>{t("common.loading")}</p>
      ) : search.isError ? (
        <p>{t("common.errorLoading")}</p>
      ) : items.length === 0 ? (
        <p>{t("search.empty")}</p>
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

      {totalPages > 1 ? (
        <nav
          style={{
            display: "flex",
            gap: "var(--space-3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            style={btn}
          >
            ‹
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            style={btn}
          >
            ›
          </button>
        </nav>
      ) : null}
    </div>
  );
}

const btn = {
  padding: "var(--space-2) var(--space-4)",
  minHeight: 44,
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
};
