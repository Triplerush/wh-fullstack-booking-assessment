import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer
      style={{
        padding: "var(--space-5)",
        borderTop: "1px solid var(--color-border)",
        textAlign: "center",
        color: "var(--color-text-muted)",
      }}
    >
      <small>{t("footer.tagline")}</small>
    </footer>
  );
}
