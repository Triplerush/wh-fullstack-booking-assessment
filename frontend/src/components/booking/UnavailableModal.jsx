import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function UnavailableModal({ open, onChooseDates, onBackToSearch }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") onChooseDates();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onChooseDates]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unavailable-modal-title"
    >
      <div className="modal-card">
        <h2 id="unavailable-modal-title" className="modal-title">
          {t("checkout.unavailable.title")}
        </h2>
        <p className="modal-body">{t("checkout.unavailable.body")}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn modal-btn-secondary"
            onClick={onBackToSearch}
          >
            {t("checkout.unavailable.backToSearch")}
          </button>
          <button
            type="button"
            className="btn modal-btn-primary"
            onClick={onChooseDates}
          >
            {t("checkout.unavailable.chooseDates")}
          </button>
        </div>
      </div>
    </div>
  );
}
