import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getBookings } from "../api/bookings";
import { formatPrice } from "../utils/currency";

export function MyBookingsPage() {
  const { t, i18n } = useTranslation();

  const query = useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: getBookings,
  });

  const items = query.data?.results ?? query.data ?? [];

  return (
    <div className="form-page solo">
      <section>
        <h1 className="form-title">{t("bookings.mine.title")}</h1>
        <p className="form-intro" style={{ marginBottom: 28 }}>
          {items.length} {t("search.resultsCount", { count: items.length }).replace(/^\d+\s*/, "")}
        </p>
        {query.isLoading ? (
          <p>{t("common.loading")}</p>
        ) : query.isError ? (
          <p>{t("common.errorLoading")}</p>
        ) : items.length === 0 ? (
          <p>{t("bookings.mine.empty")}</p>
        ) : (
          <ul className="bookings-list">
            {items.map((b) => (
              <li key={b.id}>
                <div className="thumb">
                  {b.property.cover_image?.url ? (
                    <img src={b.property.cover_image.url} alt="" loading="lazy" />
                  ) : null}
                </div>
                <div>
                  <h3>{b.property.title}</h3>
                  <p className="meta">
                    {b.check_in} → {b.check_out} · {b.nights}{" "}
                    {t("catalog.nights", { count: b.nights })} · {b.guests}{" "}
                    {t("catalog.guests", { count: b.guests })}
                  </p>
                  <p className="code">
                    {b.code} · {b.status}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className="price">
                    {formatPrice(b.total_price, b.currency, i18n.language)}
                  </p>
                  <Link
                    to={`/booking/${b.id}/confirmation`}
                    style={{ fontSize: 12, fontWeight: 800, textDecoration: "underline" }}
                  >
                    {t("bookings.mine.viewDetails")}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
