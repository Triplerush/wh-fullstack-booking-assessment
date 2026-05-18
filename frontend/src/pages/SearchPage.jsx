import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import { getLocations } from "../api/catalog";
import { getProperties } from "../api/properties";
import { SkeletonLine } from "../components/ui/Skeleton";
import { formatPrice } from "../utils/currency";
import gridIconUrl from "../assets/grid-icon.svg";

function CardCarousel({ images, alt }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const list = images && images.length > 0 ? images : [];

  function go(delta, ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    if (list.length <= 1) return;
    setIdx((i) => (i + delta + list.length) % list.length);
  }

  function startAuto() {
    if (timer.current || list.length <= 1) return;
    timer.current = setInterval(() => {
      setIdx((i) => (i + 1) % list.length);
    }, 1800);
  }

  function stopAuto() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }

  useEffect(() => () => stopAuto(), []);

  return (
    <div
      className="room-card-thumb"
      onMouseEnter={startAuto}
      onMouseLeave={stopAuto}
    >
      {list.map((img, i) => (
        <img
          key={img.id ?? i}
          src={img.url}
          alt={img.alt || alt}
          className={i === idx ? "active" : ""}
          loading="lazy"
        />
      ))}
      {list.length > 1 ? (
        <>
          <button
            type="button"
            className="carousel-arrow prev"
            aria-label="Anterior"
            onClick={(e) => go(-1, e)}
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel-arrow next"
            aria-label="Siguiente"
            onClick={(e) => go(1, e)}
          >
            ›
          </button>
          <div className="carousel-dots" aria-hidden="true">
            {list.map((_, i) => (
              <span key={i} className={i === idx ? "active" : ""} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function RoomCard({ property, lang }) {
  const { t } = useTranslation();
  const cover = property.cover_image;
  const gallery =
    Array.isArray(property.gallery) && property.gallery.length > 0
      ? property.gallery
      : cover
        ? [cover]
        : [];
  const guests = property.max_guests ?? property.capacity ?? 0;
  const bedrooms = property.bedrooms ?? 0;
  return (
    <Link to={`/property/${property.slug}`} className="room-card">
      <CardCarousel images={gallery} alt={property.title} />
      <div>
        <h3 className="room-card-title">{property.title}</h3>
        <p className="room-card-zone">
          {property.location?.name}
          {property.location?.country ? `, ${property.location.country}` : ""}
        </p>
        <div className="room-card-bottom">
          <span className="room-card-price">
            {formatPrice(property.price_per_night, property.currency, lang)} /{" "}
            {t("catalog.night")}
          </span>
          <span className="room-card-spaces">
            <span>
              {guests}
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M6 6.4a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Zm0 .9c-1.9 0-5.4 1-5.4 3v1.2h10.8v-1.2c0-2-3.5-3-5.4-3Z" />
              </svg>
            </span>
            <span>
              {bedrooms}
              <svg viewBox="0 0 14 10" aria-hidden="true">
                <path d="M1 8.5V2.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1V8.5M1 6.5h12M3.4 4.5h2.4M8.2 4.5h2.4" stroke="#000" strokeWidth="0.9" fill="none" />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function RoomCardSkeleton() {
  return (
    <div className="room-card" aria-hidden="true">
      <div className="room-card-thumb skel" />
      <SkeletonLine width="70%" style={{ height: 16, marginTop: 14 }} />
      <SkeletonLine width="40%" style={{ height: 12, marginTop: 6 }} />
      <SkeletonLine width="90%" style={{ height: 14, marginTop: 10 }} />
    </div>
  );
}

export function SearchPage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const lang = i18n.language;

  const [viewMode, setViewMode] = useState("grid");

  const [draft, setDraft] = useState({
    location: params.get("location") ?? "",
    check_in: params.get("check_in") ?? "",
    check_out: params.get("check_out") ?? "",
    guests: params.get("guests") ?? "",
  });

  useEffect(() => {
    setDraft({
      location: params.get("location") ?? "",
      check_in: params.get("check_in") ?? "",
      check_out: params.get("check_out") ?? "",
      guests: params.get("guests") ?? "",
    });
  }, [params]);

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
    placeholderData: keepPreviousData,
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

  function commitFilter(field, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(field, value);
    else next.delete(field);
    next.delete("page");
    setParams(next, { replace: false });
  }

  function goToPage(p) {
    const next = new URLSearchParams(params);
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    setParams(next, { replace: false });
  }

  function toggleView() {
    setViewMode((m) => (m === "grid" ? "list" : "grid"));
  }

  return (
    <>
      <section className="search-filters-bar" aria-label={t("nav.search")}>
        <button
          type="button"
          className="view-toggle"
          onClick={toggleView}
          aria-pressed={viewMode === "list"}
          aria-label={
            viewMode === "grid"
              ? t("search.viewList")
              : t("search.viewGrid")
          }
          title={
            viewMode === "grid"
              ? t("search.viewList")
              : t("search.viewGrid")
          }
        >
          <img src={gridIconUrl} alt="" aria-hidden="true" />
        </button>
        <select
          className="filter-field"
          value={draft.location}
          onChange={(e) => {
            setDraft((d) => ({ ...d, location: e.target.value }));
            commitFilter("location", e.target.value);
          }}
          aria-label={t("search.location")}
        >
          <option value="">{t("search.allLocations")}</option>
          {(locations.data ?? []).map((loc) => (
            <option key={loc.id} value={loc.slug}>
              {loc.name}
              {loc.country ? `, ${loc.country}` : ""}
            </option>
          ))}
        </select>
        <input
          className="filter-field"
          type="date"
          value={draft.check_in}
          onChange={(e) => {
            setDraft((d) => ({ ...d, check_in: e.target.value }));
            commitFilter("check_in", e.target.value);
          }}
          aria-label={t("search.checkIn")}
        />
        <input
          className="filter-field"
          type="date"
          value={draft.check_out}
          onChange={(e) => {
            setDraft((d) => ({ ...d, check_out: e.target.value }));
            commitFilter("check_out", e.target.value);
          }}
          aria-label={t("search.checkOut")}
        />
        <input
          className="filter-field"
          type="number"
          min="1"
          value={draft.guests}
          onChange={(e) => {
            setDraft((d) => ({ ...d, guests: e.target.value }));
            commitFilter("guests", e.target.value);
          }}
          placeholder={t("search.guestsPlaceholder")}
          aria-label={t("search.guests")}
        />
      </section>

      <div className="search-content">
        <div className="search-results">
          <p className="breadcrumb">
            <Link to="/">{t("nav.home")}</Link> / {t("nav.search")}
          </p>
          <p className="search-results-showing">
            {t("search.resultsCount", { count })}
          </p>

          {search.isPending ? (
            <div className={`results-grid${viewMode === "list" ? " is-list" : ""}`}>
              <RoomCardSkeleton />
              <RoomCardSkeleton />
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </div>
          ) : search.isError ? (
            <p>{t("common.errorLoading")}</p>
          ) : items.length === 0 ? (
            <p>{t("search.empty")}</p>
          ) : (
            <div className={`results-grid${viewMode === "list" ? " is-list" : ""}`}>
              {items.map((p) => (
                <RoomCard key={p.id} property={p} lang={lang} />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="pagination" aria-label="pagination">
              <button
                type="button"
                className="btn btn-outline btn-pill"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                ‹ {t("common.previous")}
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-pill"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                {t("common.next")} ›
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </>
  );
}
