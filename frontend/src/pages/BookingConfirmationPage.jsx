import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { getBooking } from "../api/bookings";
import { formatPrice } from "../utils/currency";

export function BookingConfirmationPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();

  const query = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id),
  });

  if (query.isLoading) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        {t("common.loading")}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        {t("confirmation.notFound")}
      </div>
    );
  }
  const booking = query.data;
  const lang = i18n.language;

  const dateFmt = new Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateRange = `${dateFmt.format(new Date(booking.check_in))} — ${dateFmt.format(new Date(booking.check_out))}`;

  const nightlyTotal = Number(booking.total_price);
  const cover = booking.property.cover_image;

  return (
    <article className="confirmation-page">
      <h1 className="confirmation-greeting">{t("confirmation.greeting")}</h1>
      <p className="confirmation-eyebrow">{t("confirmation.thanks")}</p>

      {cover?.url ? (
        <div className="confirmation-image">
          <img src={cover.url} alt={cover.alt || booking.property.title} />
        </div>
      ) : null}

      <p className="confirmation-lead">{t("confirmation.lead")}</p>
      <p className="confirmation-body">
        {t("confirmation.bodyA")}
        <br />
        {t("confirmation.bodyB", { email: booking.user?.email })}
      </p>

      <hr className="confirmation-divider" />

      <section className="confirmation-details" aria-label={t("confirmation.summaryTitle")}>
        <h2>{booking.property.title}</h2>
        {booking.property.address ? (
          <p className="address">{booking.property.address}</p>
        ) : null}
        <p className="dates">{dateRange}</p>

        <table className="confirmation-table">
          <tbody>
            <tr>
              <td>{t("catalog.nights", { count: booking.nights })}</td>
              <td>{formatPrice(nightlyTotal, booking.currency, lang)}</td>
            </tr>
            <tr className="total">
              <td>{t("confirmation.total")}</td>
              <td>{formatPrice(nightlyTotal, booking.currency, lang)}</td>
            </tr>
          </tbody>
        </table>

        <p className="confirmation-body" style={{ marginTop: 18, fontSize: 12 }}>
          {t("confirmation.code")}:{" "}
          <strong style={{ fontFamily: "ui-monospace, monospace" }}>
            {booking.code}
          </strong>
        </p>
      </section>

      <div className="confirmation-actions">
        <Link to="/me/bookings" className="btn btn-outline">
          {t("confirmation.goToMyBookings")}
        </Link>
      </div>

      <p className="confirmation-footer">{t("confirmation.tagline")}</p>
    </article>
  );
}
