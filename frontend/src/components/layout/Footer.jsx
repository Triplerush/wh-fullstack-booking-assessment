import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import logoUrl from "../../assets/logo.svg";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand-row">
          <div className="footer-logo">
            <img src={logoUrl} alt={t("app.title")} />
          </div>
          <nav className="footer-socials" aria-label="Redes sociales">
            <a href="#instagram" aria-label="Instagram">
              {/* Icono Instagram inline (Simple Icons / dominio público) */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.22.06 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.41 2.22a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.22.41-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.22-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.22-.41C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.52.01-4.76.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.27.83-.39.39-.63.76-.83 1.27-.15.39-.33.97-.38 2.04C2.66 8.48 2.65 8.85 2.65 12s.01 3.52.07 4.76c.05 1.07.23 1.65.38 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.15.97.33 2.04.38 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.27-.83.39-.39.63-.76.83-1.27.15-.39.33-.97.38-2.04.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.07-.23-1.65-.38-2.04a3.43 3.43 0 0 0-.83-1.27 3.43 3.43 0 0 0-1.27-.83c-.39-.15-.97-.33-2.04-.38C15.52 4.01 15.15 4 12 4Zm0 3.05a4.95 4.95 0 1 1 0 9.9 4.95 4.95 0 0 1 0-9.9Zm0 1.8a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3Zm5.16-2a1.18 1.18 0 1 1 0 2.36 1.18 1.18 0 0 1 0-2.36Z" />
              </svg>
            </a>
            <a href="#linkedin" aria-label="LinkedIn">
              {/* Icono LinkedIn inline */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
              </svg>
            </a>
            <a href="#tiktok" aria-label="TikTok">
              {/* Icono TikTok inline */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.32 6.32 0 0 0-1-.07A6.34 6.34 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.81a8.16 8.16 0 0 0 4.77 1.52V6.89c-.6 0-1.2-.07-1.84-.2Z" />
              </svg>
            </a>
            <a href="#youtube" aria-label="YouTube">
              {/* Icono YouTube inline */}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
              </svg>
            </a>
          </nav>
        </div>

        <section className="contact-banner" aria-label={t("footer.contact.title")}>
          <h3>{t("footer.contact.title")}</h3>
          <div className="contact-banner-links">
            <a href={`mailto:${t("footer.contact.email")}`}>
              {t("footer.contact.email")}
            </a>
            <a href="tel:+34900000000">{t("footer.contact.phone")}</a>
            <a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noreferrer noopener"
            >
              {t("footer.contact.whatsapp")}
            </a>
          </div>
        </section>

        <div className="footer-columns">
          <div>
            <h3>{t("footer.destinations.title")}</h3>
            <Link to="/search?location=madrid">Madrid</Link>
            <Link to="/search?location=barcelona">Barcelona</Link>
            <Link to="/search?location=valencia">Valencia</Link>
            <Link to="/search?location=sevilla">Sevilla</Link>
            <Link to="/search?location=malaga">Málaga</Link>
          </div>
          <div>
            <h3>{t("footer.discover.title")}</h3>
            <a href="#collection">{t("footer.discover.collection")}</a>
            <a href="#casa">{t("footer.discover.casa")}</a>
            <a href="#benefits">{t("footer.discover.benefits")}</a>
          </div>
          <div>
            <h3>{t("footer.services.title")}</h3>
            <a href="#long-stays">{t("footer.services.longStays")}</a>
            <a href="#events">{t("footer.services.events")}</a>
            <a href="#guides">{t("footer.services.guides")}</a>
          </div>
          <div>
            <h3>{t("footer.help.title")}</h3>
            <a href="#faq">{t("footer.help.faq")}</a>
            <a href="#terms">{t("footer.help.terms")}</a>
            <a href="#privacy">{t("footer.help.privacy")}</a>
          </div>
          <div>
            <h3>{t("footer.about.title")}</h3>
            <a href="#about">{t("footer.about.who")}</a>
            <a href="#blog">{t("footer.about.blog")}</a>
            <a href="#careers">{t("footer.about.careers")}</a>
          </div>
        </div>

        <div className="footer-legal">
          <span>© {new Date().getFullYear()} Wind Homes</span>
        </div>
      </div>
    </footer>
  );
}
