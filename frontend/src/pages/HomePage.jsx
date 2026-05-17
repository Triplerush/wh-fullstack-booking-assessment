import { useTranslation } from "react-i18next";

export function HomePage() {
  const { t } = useTranslation();
  return (
    <section>
      <h2>{t("home.title")}</h2>
      <p>{t("home.subtitle")}</p>
    </section>
  );
}
