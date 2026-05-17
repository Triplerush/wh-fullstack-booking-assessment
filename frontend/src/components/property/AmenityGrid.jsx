import { useTranslation } from "react-i18next";

export function AmenityGrid({ amenities = [] }) {
  const { t } = useTranslation();
  if (!amenities.length) {
    return <p style={{ color: "var(--color-text-muted)" }}>{t("property.noAmenities")}</p>;
  }
  return (
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "var(--space-3)",
      }}
    >
      {amenities.map((a) => (
        <li
          key={a.id}
          style={{
            padding: "var(--space-3)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {a.icon ? <span aria-hidden="true">· </span> : null}
          {a.name}
        </li>
      ))}
    </ul>
  );
}
