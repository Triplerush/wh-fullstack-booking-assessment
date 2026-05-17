import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <header
      style={{
        padding: "var(--space-4) var(--space-5)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "var(--space-4)",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <h1 style={{ fontSize: "1.5rem" }}>{t("app.title")}</h1>
      </Link>
      <nav style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
        {isLoading ? null : isAuthenticated ? (
          <>
            <Link to="/me/bookings">{t("nav.myBookings")}</Link>
            <span>
              {t("nav.greeting", { name: user?.full_name || user?.email })}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-2) var(--space-3)",
                cursor: "pointer",
              }}
            >
              {t("nav.logout")}
            </button>
          </>
        ) : (
          <>
            <Link to="/login">{t("nav.login")}</Link>
            <Link to="/register">{t("nav.register")}</Link>
          </>
        )}
      </nav>
    </header>
  );
}
