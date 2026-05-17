import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { createBooking } from "../api/bookings";
import { BookingSummaryCard } from "../components/booking/BookingSummaryCard";
import { TextInput } from "../components/forms/TextInput";
import { FormError } from "../components/forms/FormError";
import { useAuth } from "../context/AuthContext";
import { mockPaymentSchema } from "../schemas/payment";
import { applyDrfErrorsToForm } from "../utils/apiErrors";
import { draftStorage } from "../utils/bookingDraft";

const PAYMENT_FIELDS = ["card_number", "expiry", "cvv", "cardholder", "accept_terms"];

export function CheckoutPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const draft = useMemo(() => draftStorage.read(), []);
  const [banner, setBanner] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(mockPaymentSchema),
    defaultValues: {
      card_number: "",
      expiry: "",
      cvv: "",
      cardholder: "",
      accept_terms: false,
    },
  });

  useEffect(() => {
    if (!draft) {
      const id = setTimeout(() => navigate("/search", { replace: true }), 0);
      return () => clearTimeout(id);
    }
  }, [draft, navigate]);

  if (isLoading) return <p>…</p>;
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (!draft) {
    return <p>{t("checkout.noDraft")}</p>;
  }

  async function onSubmit(_values) {
    setBanner(null);
    try {
      const booking = await createBooking({
        property_id: draft.propertyId,
        check_in: draft.checkIn,
        check_out: draft.checkOut,
        guests: draft.guests,
      });
      draftStorage.clear();
      navigate(`/booking/${booking.id}/confirmation`, { replace: true });
    } catch (err) {
      const msg = applyDrfErrorsToForm(err, setError, PAYMENT_FIELDS);
      setBanner(msg ?? t("checkout.genericError"));
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
        gap: "var(--space-5)",
      }}
    >
      <section>
        <h2 style={{ marginBottom: "var(--space-4)" }}>{t("checkout.title")}</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <h3 style={{ marginBottom: "var(--space-3)" }}>{t("checkout.paymentDetails")}</h3>
          <TextInput
            label={t("checkout.cardholder")}
            autoComplete="cc-name"
            {...register("cardholder")}
            error={errors.cardholder?.message}
          />
          <TextInput
            label={t("checkout.cardNumber")}
            inputMode="numeric"
            placeholder="4111111111111111"
            autoComplete="cc-number"
            {...register("card_number")}
            error={errors.card_number?.message}
          />
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <div style={{ flex: 1 }}>
              <TextInput
                label={t("checkout.expiry")}
                placeholder="MM/AA"
                autoComplete="cc-exp"
                {...register("expiry")}
                error={errors.expiry?.message}
              />
            </div>
            <div style={{ flex: 1 }}>
              <TextInput
                label={t("checkout.cvv")}
                inputMode="numeric"
                autoComplete="cc-csc"
                {...register("cvv")}
                error={errors.cvv?.message}
              />
            </div>
          </div>
          <label style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginTop: "var(--space-3)" }}>
            <input type="checkbox" {...register("accept_terms")} />
            <span>{t("checkout.acceptTerms")}</span>
          </label>
          <FormError>{errors.accept_terms?.message}</FormError>
          <FormError>{banner}</FormError>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: "var(--space-4)",
              padding: "var(--space-3) var(--space-5)",
              minHeight: 44,
              background: "var(--color-brand)",
              color: "#fff",
              border: 0,
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {isSubmitting ? t("auth.submitting") : t("checkout.confirmAndPay")}
          </button>
        </form>
      </section>
      <BookingSummaryCard draft={draft} />
    </div>
  );
}
