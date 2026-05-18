import { useTranslation } from "react-i18next";

const ICONS = {
  wifi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14 0" />
      <path d="M2 8.82a16 16 0 0 1 20 0" />
      <path d="M8.5 16.43a6 6 0 0 1 7 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  ),
  pool: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1" />
      <path d="M2 16c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1" />
      <path d="M7 13V5a2 2 0 0 1 4 0" />
      <path d="M13 13V5a2 2 0 0 1 4 0" />
    </svg>
  ),
  ac: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20" />
      <path d="M2 12h20" />
      <path d="M5 5l14 14" />
      <path d="M19 5L5 19" />
    </svg>
  ),
  kitchen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <line x1="4" y1="11" x2="20" y2="11" />
      <circle cx="8" cy="7" r="1" fill="currentColor" />
      <circle cx="12" cy="7" r="1" fill="currentColor" />
      <rect x="9" y="14" width="6" height="5" />
    </svg>
  ),
  parking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  ),
  washer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <circle cx="12" cy="14" r="4.5" />
      <circle cx="7" cy="6.5" r="0.7" fill="currentColor" />
      <circle cx="10" cy="6.5" r="0.7" fill="currentColor" />
    </svg>
  ),
  heating: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c1.5 2 1.5 3.5 0 5s-1.5 3 0 5 1.5 3.5 0 5" />
      <path d="M7 5c1 1.5 1 2.5 0 4s-1 2.5 0 4" />
      <path d="M17 5c1 1.5 1 2.5 0 4s-1 2.5 0 4" />
    </svg>
  ),
  terrace: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11h18L12 3 3 11Z" />
      <path d="M5 11v9" />
      <path d="M19 11v9" />
      <path d="M5 16h14" />
    </svg>
  ),
};

const FALLBACK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export function AmenityGrid({ amenities = [] }) {
  const { t } = useTranslation();
  if (!amenities.length) {
    return <p className="muted">{t("property.noAmenities")}</p>;
  }
  return (
    <ul className="amenity-grid">
      {amenities.map((a) => {
        const icon = ICONS[a.icon] || ICONS[a.slug] || FALLBACK;
        return (
          <li key={a.id} className="amenity">
            <span className="amenity-icon" aria-hidden="true">{icon}</span>
            <span className="amenity-label">{a.name}</span>
          </li>
        );
      })}
    </ul>
  );
}
