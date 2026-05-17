import { useTranslation } from "react-i18next";

import { formatPrice } from "../../utils/currency";

/**
 * Marcador: muestra precio y pista de capacidad. La comprobación de
 * disponibilidad y el flujo de reserva se conectan más adelante.
 */
export function StickyBookingCard({ property }) {
  const { t, i18n } = useTranslation();
  return (
    <aside
      style={{
        position: "sticky",
        top: "var(--space-5)",
        padding: "var(--space-5)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 600 }}>
        {formatPrice(property.price_per_night, property.currency, i18n.language)}{" "}
        <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--color-text-muted)" }}>
          / {t("catalog.night")}
        </span>
      </p>
      <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-3)" }}>
        {t("property.bookingComingSoon")}
      </p>
      <button
        type="button"
        disabled
        style={{
          marginTop: "var(--space-4)",
          width: "100%",
          padding: "var(--space-3)",
          minHeight: 44,
          background: "var(--color-surface-alt)",
          color: "var(--color-text-muted)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          cursor: "not-allowed",
        }}
      >
        {t("property.checkAvailability")}
      </button>
    </aside>
  );
}
