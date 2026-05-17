import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export function MyBookingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <section>
      <h2>{t("bookings.mine.title")}</h2>
      <p>
        {t("bookings.mine.empty", { defaultValue: "Sin reservas aún." })}
        {user ? ` (${user.email})` : null}
      </p>
    </section>
  );
}
