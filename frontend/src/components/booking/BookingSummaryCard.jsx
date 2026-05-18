import { useTranslation } from "react-i18next";

import { formatPrice } from "../../utils/currency";

export function BookingSummaryCard({ draft }) {
  const { t, i18n } = useTranslation();
  if (!draft) return null;
  return (
    <aside className="booking-summary">
      <h3 className="display-md" style={{ marginBottom: 16 }}>
        {t("checkout.summaryTitle")}
      </h3>
      <div className="summary-property">
        <div className="thumb">
          {draft.coverImageUrl ? (
            <img src={draft.coverImageUrl} alt="" loading="lazy" />
          ) : null}
        </div>
        <div>
          <h3>{draft.propertyTitle}</h3>
          <p>{draft.locationName}</p>
        </div>
      </div>
      <div className="summary-row">
        <span>{t("checkout.dates")}</span>
        <strong>
          {draft.checkIn} → {draft.checkOut}
        </strong>
      </div>
      <div className="summary-row">
        <span>{t("checkout.nights")}</span>
        <strong>{draft.nights}</strong>
      </div>
      <div className="summary-row">
        <span>{t("checkout.guests")}</span>
        <strong>{draft.guests}</strong>
      </div>
      <div className="total-row">
        <span>{t("checkout.total")}</span>
        <span>{formatPrice(draft.totalPrice, draft.currency, i18n.language)}</span>
      </div>
    </aside>
  );
}
