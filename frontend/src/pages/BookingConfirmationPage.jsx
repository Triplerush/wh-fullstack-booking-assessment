import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { getBooking } from "../api/bookings";
import { BookingSummaryCard } from "../components/booking/BookingSummaryCard";
import { formatPrice } from "../utils/currency";

export function BookingConfirmationPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();

  const query = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id),
  });

  if (query.isLoading) return <p>{t("common.loading")}</p>;
  if (query.isError) return <p>{t("confirmation.notFound")}</p>;
  const booking = query.data;

  const draftLike = {
    propertyTitle: booking.property.title,
    coverImageUrl: booking.property.cover_image?.url ?? null,
    locationName: booking.property.location?.name ?? "",
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    nights: booking.nights,
    guests: booking.guests,
    totalPrice: booking.total_price,
    currency: booking.currency,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
        gap: "var(--space-5)",
      }}
    >
      <section>
        <h2 style={{ marginBottom: "var(--space-2)" }}>{t("confirmation.title")}</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
          {t("confirmation.intro", { email: booking.user?.email })}
        </p>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            rowGap: "var(--space-3)",
            columnGap: "var(--space-4)",
          }}
        >
          <dt>{t("confirmation.code")}</dt>
          <dd style={{ margin: 0, fontFamily: "monospace" }}>{booking.code}</dd>
          <dt>{t("confirmation.status")}</dt>
          <dd style={{ margin: 0 }}>{booking.status}</dd>
          <dt>{t("confirmation.total")}</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>
            {formatPrice(booking.total_price, booking.currency, i18n.language)}
          </dd>
        </dl>
        <p style={{ marginTop: "var(--space-5)" }}>
          <Link to="/me/bookings">{t("confirmation.goToMyBookings")}</Link>
        </p>
      </section>
      <BookingSummaryCard draft={draftLike} />
    </div>
  );
}
