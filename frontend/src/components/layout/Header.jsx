import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import logoUrl from "../../assets/logo.svg";
import { useAuth } from "../../context/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="brand-header">
      <Link to="/" className="brand" aria-label={t("app.title")}>
        <img src={logoUrl} alt={t("app.title")} className="brand-logo" />
      </Link>
      <div />
      <div className="header-right">
        {isLoading ? null : isAuthenticated ? (
          <>
            <Link to="/me/bookings" className="header-link">
              {t("nav.myBookings")}
            </Link>
            <span className="muted" style={{ fontSize: 12 }}>
              {t("nav.greeting", { name: user?.full_name || user?.email })}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="header-link"
              style={{ border: 0, background: "transparent" }}
            >
              {t("nav.logout")}
            </button>
          </>
        ) : (
          <Link to="/login" className="header-link">
            {t("nav.login")}
          </Link>
        )}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
