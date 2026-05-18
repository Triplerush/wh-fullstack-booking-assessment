import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { checkAvailability } from "../../api/properties";
import { draftStorage } from "../../utils/bookingDraft";
import { formatPrice } from "../../utils/currency";
import { FormError } from "../forms/FormError";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function StickyBookingCard({ property }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    check_in: params.get("check_in") ?? "",
    check_out: params.get("check_out") ?? "",
    guests: params.get("guests") ?? "2",
  });
  const [quote, setQuote] = useState(null);
  const [errors, setErrors] = useState(null);
  const [banner, setBanner] = useState(null);
  const [pending, setPending] = useState(false);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setQuote(null);
      setErrors(null);
      setBanner(null);
    };
  }

  async function onCheckAvailability(e) {
    e.preventDefault();
    setQuote(null);
    setErrors(null);
    setBanner(null);
    setPending(true);
    try {
      const result = await checkAvailability(property.slug, {
        check_in: form.check_in,
        check_out: form.check_out,
        guests: Number(form.guests),
      });
      if (result.available) {
        setQuote(result);
      } else {
        const fieldErrors = result.errors || {};
        setErrors(fieldErrors);
        if (fieldErrors.non_field_errors?.length) {
          setBanner(fieldErrors.non_field_errors.join(" "));
        }
      }
    } catch (_err) {
      setBanner(t("property.availabilityError"));
    } finally {
      setPending(false);
    }
  }

  function onReserve() {
    if (!quote) return;
    draftStorage.save({
      propertyId: property.id,
      propertySlug: property.slug,
      propertyTitle: property.title,
      coverImageUrl: property.cover_image?.url ?? null,
      locationName: property.location?.name ?? "",
      address: property.address ?? "",
      checkIn: form.check_in,
      checkOut: form.check_out,
      guests: Number(form.guests),
      nights: quote.nights,
      totalPrice: quote.total_price,
      currency: quote.currency,
    });
    navigate("/checkout");
  }

  const canCheck =
    form.check_in && form.check_out && form.guests && form.check_in >= todayISO();

  return (
    <aside className="booking-box" id="booking-form">
      <p className="price-hero">
        {formatPrice(property.price_per_night, property.currency, i18n.language)}
        <small>/ {t("catalog.night")}</small>
      </p>

      <div className="booking-tabs" role="tablist">
        <button type="button" role="tab" aria-pressed="true">
          {t("property.tabDaily")}
        </button>
      </div>

      <form onSubmit={onCheckAvailability} className="booking-form" noValidate>
        <div className="form-group">
          <label htmlFor="bk-check-in">{t("search.checkIn")}</label>
          <input
            id="bk-check-in"
            type="date"
            min={todayISO()}
            value={form.check_in}
            onChange={update("check_in")}
          />
          {errors?.check_in?.[0] ? (
            <p className="field-error">{errors.check_in[0]}</p>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="bk-check-out">{t("search.checkOut")}</label>
          <input
            id="bk-check-out"
            type="date"
            min={form.check_in || todayISO()}
            value={form.check_out}
            onChange={update("check_out")}
          />
          {errors?.check_out?.[0] ? (
            <p className="field-error">{errors.check_out[0]}</p>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="bk-guests">{t("search.guests")}</label>
          <input
            id="bk-guests"
            type="number"
            min="1"
            max={property.max_guests}
            value={form.guests}
            onChange={update("guests")}
          />
          {errors?.guests?.[0] ? (
            <p className="field-error">{errors.guests[0]}</p>
          ) : null}
        </div>

        <FormError>{banner}</FormError>

        <button
          type="submit"
          className="btn-reserve"
          disabled={!canCheck || pending}
        >
          {pending ? t("auth.submitting") : t("property.checkAvailability")}
        </button>
      </form>

      {quote ? (
        <div className="booking-quote">
          <div className="summary-row">
            <span>
              {formatPrice(property.price_per_night, property.currency, i18n.language)} × {quote.nights}{" "}
              {t("catalog.nights", { count: quote.nights })}
            </span>
            <strong>{formatPrice(quote.total_price, quote.currency, i18n.language)}</strong>
          </div>
          <div className="total-row">
            <span>{t("checkout.total")}</span>
            <span>{formatPrice(quote.total_price, quote.currency, i18n.language)}</span>
          </div>
          <button
            type="button"
            onClick={onReserve}
            className="btn-reserve btn-reserve-primary"
          >
            {t("property.reserve")} →
          </button>
        </div>
      ) : null}
    </aside>
  );
}
