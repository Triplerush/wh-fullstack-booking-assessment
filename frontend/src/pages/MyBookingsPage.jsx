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

  if (query.isLoading) return <p>{t("common.loading")}</p>;
  if (query.isError) return <p>{t("common.errorLoading")}</p>;

  const items = query.data?.results ?? query.data ?? [];

  return (
    <section>
      <h2 style={{ marginBottom: "var(--space-4)" }}>{t("bookings.mine.title")}</h2>
      {items.length === 0 ? (
        <p>{t("bookings.mine.empty")}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "var(--space-3)" }}>
          {items.map((b) => (
            <li
              key={b.id}
              style={{
                padding: "var(--space-4)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface)",
                display: "grid",
                gridTemplateColumns: "120px 1fr auto",
                gap: "var(--space-4)",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  aspectRatio: "1 / 1",
                  background: "var(--color-surface-alt)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                }}
              >
                {b.property.cover_image?.url ? (
                  <img
                    src={b.property.cover_image.url}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : null}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{b.property.title}</h3>
                <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-text-muted)" }}>
                  {b.check_in} → {b.check_out} · {b.nights} {t("catalog.nights", { count: b.nights })} · {b.guests}{" "}
                  {t("catalog.guests", { count: b.guests })}
                </p>
                <p style={{ margin: "var(--space-1) 0 0", fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {b.code} · {b.status}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {formatPrice(b.total_price, b.currency, i18n.language)}
                </p>
                <Link to={`/booking/${b.id}/confirmation`}>{t("bookings.mine.viewDetails")}</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
