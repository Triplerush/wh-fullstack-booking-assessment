import { useTranslation } from "react-i18next";

import { formatPrice } from "../../utils/currency";

export function BookingSummaryCard({ draft }) {
  const { t, i18n } = useTranslation();
  if (!draft) return null;
  return (
    <aside
      style={{
        padding: "var(--space-5)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {draft.coverImageUrl ? (
        <div
          style={{
            aspectRatio: "16 / 10",
            background: "var(--color-surface-alt)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            marginBottom: "var(--space-3)",
          }}
        >
          <img
            src={draft.coverImageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      ) : null}
      <h3 style={{ marginBottom: "var(--space-1)" }}>{draft.propertyTitle}</h3>
      <p style={{ color: "var(--color-text-muted)", margin: 0 }}>{draft.locationName}</p>
      <hr style={{ margin: "var(--space-3) 0", border: 0, borderTop: "1px solid var(--color-border)" }} />
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", rowGap: "var(--space-2)", columnGap: "var(--space-3)" }}>
        <dt>{t("checkout.dates")}</dt>
        <dd style={{ margin: 0, textAlign: "right" }}>
          {draft.checkIn} → {draft.checkOut}
        </dd>
        <dt>{t("checkout.nights")}</dt>
        <dd style={{ margin: 0, textAlign: "right" }}>{draft.nights}</dd>
        <dt>{t("checkout.guests")}</dt>
        <dd style={{ margin: 0, textAlign: "right" }}>{draft.guests}</dd>
      </dl>
      <hr style={{ margin: "var(--space-3) 0", border: 0, borderTop: "1px solid var(--color-border)" }} />
      <p
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: 0,
          fontSize: "1.1rem",
        }}
      >
        <span>{t("checkout.total")}</span>
        <strong>{formatPrice(draft.totalPrice, draft.currency, i18n.language)}</strong>
      </p>
    </aside>
  );
}
