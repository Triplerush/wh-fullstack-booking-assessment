import { useTranslation } from "react-i18next";

export function MapPlaceholder({ lat, lng, address }) {
  const { t } = useTranslation();
  return (
    <div className="map-placeholder">
      <div>
        <strong>{t("property.mapPlaceholder")}</strong>
        {address ? (
          <p style={{ marginTop: 6, fontSize: 12, fontWeight: 700 }}>{address}</p>
        ) : null}
        {lat && lng ? (
          <p style={{ marginTop: 2, fontSize: 11 }}>
            {Number(lat).toFixed(3)}, {Number(lng).toFixed(3)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
