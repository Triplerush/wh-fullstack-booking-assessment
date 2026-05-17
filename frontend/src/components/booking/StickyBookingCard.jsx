import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { checkAvailability } from "../../api/properties";
import { TextInput } from "../forms/TextInput";
import { FormError } from "../forms/FormError";
import { useAuth } from "../../context/AuthContext";
import { draftStorage } from "../../utils/bookingDraft";
import { formatPrice } from "../../utils/currency";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function StickyBookingCard({ property }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent("/checkout")}`);
      return;
    }
    navigate("/checkout");
  }

  const canCheck =
    form.check_in && form.check_out && form.guests && form.check_in >= todayISO();

  return (
    <aside
      style={{
        position: "sticky",
        top: "var(--space-5)",
        padding: "var(--space-5)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 600 }}>
        {formatPrice(property.price_per_night, property.currency, i18n.language)}{" "}
        <span style={{ fontSize: "0.9rem", fontWeight: 400, color: "var(--color-text-muted)" }}>
          / {t("catalog.night")}
        </span>
      </p>

      <form onSubmit={onCheckAvailability} style={{ marginTop: "var(--space-4)" }} noValidate>
        <TextInput
          label={t("search.checkIn")}
          type="date"
          min={todayISO()}
          value={form.check_in}
          onChange={update("check_in")}
          error={errors?.check_in?.[0]}
        />
        <TextInput
          label={t("search.checkOut")}
          type="date"
          min={form.check_in || todayISO()}
          value={form.check_out}
          onChange={update("check_out")}
          error={errors?.check_out?.[0]}
        />
        <TextInput
          label={t("search.guests")}
          type="number"
          min="1"
          max={property.max_guests}
          value={form.guests}
          onChange={update("guests")}
          error={errors?.guests?.[0]}
        />
        <FormError>{banner}</FormError>
        <button
          type="submit"
          disabled={!canCheck || pending}
          style={{
            marginTop: "var(--space-3)",
            width: "100%",
            padding: "var(--space-3)",
            minHeight: 44,
            background: canCheck ? "var(--color-brand)" : "var(--color-surface-alt)",
            color: canCheck ? "#fff" : "var(--color-text-muted)",
            border: 0,
            borderRadius: "var(--radius-sm)",
            cursor: canCheck && !pending ? "pointer" : "not-allowed",
          }}
        >
          {pending ? t("auth.submitting") : t("property.checkAvailability")}
        </button>
      </form>

      {quote ? (
        <div style={{ marginTop: "var(--space-4)" }}>
          <p style={{ margin: 0 }}>
            {formatPrice(property.price_per_night, property.currency, i18n.language)}{" "}
            × {quote.nights} {t("catalog.nights", { count: quote.nights })} ={" "}
            <strong>{formatPrice(quote.total_price, quote.currency, i18n.language)}</strong>
          </p>
          <button
            type="button"
            onClick={onReserve}
            style={{
              marginTop: "var(--space-3)",
              width: "100%",
              padding: "var(--space-3)",
              minHeight: 44,
              background: "var(--color-brand-accent)",
              color: "#111",
              border: 0,
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("property.reserve")}
          </button>
        </div>
      ) : null}
    </aside>
  );
}
