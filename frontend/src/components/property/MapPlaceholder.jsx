import { useTranslation } from "react-i18next";

export function MapPlaceholder({ lat, lng, address }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        background: "var(--color-surface-alt)",
        border: "1px dashed var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-5)",
        textAlign: "center",
        color: "var(--color-text-muted)",
      }}
    >
      <strong>{t("property.mapPlaceholder")}</strong>
      <p style={{ margin: "var(--space-2) 0 0", fontSize: "0.9rem" }}>
        {address}
      </p>
      {lat && lng ? (
        <p style={{ margin: "var(--space-1) 0 0", fontSize: "0.8rem" }}>
          {lat}, {lng}
        </p>
      ) : null}
    </div>
  );
}
