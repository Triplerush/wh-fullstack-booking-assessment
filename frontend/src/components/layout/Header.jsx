import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();
  return (
    <header
      style={{
        padding: "var(--space-4) var(--space-5)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1 style={{ fontSize: "1.5rem" }}>{t("app.title")}</h1>
      <nav style={{ display: "flex", gap: "var(--space-4)" }}>
        <a href="/login">{t("nav.login")}</a>
        <a href="/register">{t("nav.register")}</a>
      </nav>
    </header>
  );
}
