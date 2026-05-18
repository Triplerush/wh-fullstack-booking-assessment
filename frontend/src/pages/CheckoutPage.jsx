import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { createBooking } from "../api/bookings";
import { BookingSummaryCard } from "../components/booking/BookingSummaryCard";
import { FormError } from "../components/forms/FormError";
import { InlineLoginForm } from "../components/forms/InlineLoginForm";
import { InlineRegisterForm } from "../components/forms/InlineRegisterForm";
import { TextInput } from "../components/forms/TextInput";
import { useAuth } from "../context/AuthContext";
import { mockPaymentSchema } from "../schemas/payment";
import { applyDrfErrorsToForm } from "../utils/apiErrors";
import { draftStorage } from "../utils/bookingDraft";
import { formatCardNumber, formatExpiry } from "../utils/cardMask";

const PAYMENT_FIELDS = ["card_number", "expiry", "cvv", "cardholder", "accept_terms"];

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const draft = useMemo(() => draftStorage.read(), []);
  const [banner, setBanner] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
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

  function maskedRegister(name, mask) {
    const reg = register(name);
    return {
      ...reg,
      onChange: (e) => {
        const formatted = mask(e.target.value);
        e.target.value = formatted;
        setValue(name, formatted, { shouldValidate: false });
      },
    };
  }

  useEffect(() => {
    if (!draft) {
      const id = setTimeout(() => navigate("/search", { replace: true }), 0);
      return () => clearTimeout(id);
    }
  }, [draft, navigate]);

  if (isLoading) return <p style={{ padding: 48 }}>{t("common.loading")}</p>;
  if (!draft) return <p style={{ padding: 48 }}>{t("checkout.noDraft")}</p>;

  async function onSubmit(_values) {
    setBanner(null);
    try {
      const booking = await createBooking({
        property_id: draft.propertyId,
        check_in: draft.checkIn,
        check_out: draft.checkOut,
        guests: draft.guests,
        language: i18n.language?.slice(0, 2),
      });
      draftStorage.clear();
      navigate(`/booking/${booking.id}/confirmation`, { replace: true });
    } catch (err) {
      const msg = applyDrfErrorsToForm(err, setError, PAYMENT_FIELDS);
      setBanner(msg ?? t("checkout.genericError"));
    }
  }

  const paymentDisabled = !isAuthenticated;

  return (
    <div className="form-page">
      <section>
        <h1 className="form-title">{t("checkout.title")}</h1>
        <p className="form-intro">{t("checkout.guest.subtitle")}</p>

        {!isAuthenticated ? (
          authMode === "login" ? (
            <InlineLoginForm
              onSuccess={() => undefined}
              onSwitchToRegister={() => setAuthMode("register")}
            />
          ) : (
            <>
              <InlineRegisterForm onSuccess={() => undefined} />
              <div className="inline-auth-switch">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="link-button"
                >
                  {t("auth.register.hasAccount")}{" "}
                  <span className="link-button-strong">{t("auth.login.submit")}</span>
                </button>
              </div>
            </>
          )
        ) : null}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-disabled={paymentDisabled}
          style={{ opacity: paymentDisabled ? 0.55 : 1 }}
        >
          <h2 className="form-title small">{t("checkout.paymentDetails")}</h2>
          {paymentDisabled ? (
            <p className="form-note" style={{ marginBottom: 16 }}>
              {t("checkout.paymentLockedHint")}
            </p>
          ) : null}
          <TextInput
            label={t("checkout.cardholder")}
            autoComplete="cc-name"
            {...register("cardholder")}
            error={errors.cardholder?.message}
            disabled={paymentDisabled}
          />
          <TextInput
            label={t("checkout.cardNumber")}
            inputMode="numeric"
            placeholder="4111 1111 1111 1111"
            autoComplete="cc-number"
            maxLength={23}
            {...maskedRegister("card_number", formatCardNumber)}
            error={errors.card_number?.message}
            disabled={paymentDisabled}
          />
          <div className="form-grid">
            <TextInput
              label={t("checkout.expiry")}
              inputMode="numeric"
              placeholder="MM/AA"
              autoComplete="cc-exp"
              maxLength={5}
              {...maskedRegister("expiry", formatExpiry)}
              error={errors.expiry?.message}
              disabled={paymentDisabled}
            />
            <TextInput
              label={t("checkout.cvv")}
              inputMode="numeric"
              maxLength={4}
              autoComplete="cc-csc"
              {...register("cvv")}
              error={errors.cvv?.message}
              disabled={paymentDisabled}
            />
          </div>
          <label className="check-row">
            <input
              type="checkbox"
              {...register("accept_terms")}
              disabled={paymentDisabled}
            />
            <span>{t("checkout.acceptTerms")}</span>
          </label>
          <FormError>{errors.accept_terms?.message}</FormError>
          <FormError>{banner}</FormError>
          <button
            type="submit"
            disabled={isSubmitting || paymentDisabled}
            className="btn btn-block"
            style={{ marginTop: 12 }}
          >
            {isSubmitting ? t("auth.submitting") : t("checkout.confirmAndPay")}
          </button>
        </form>
      </section>
      <BookingSummaryCard draft={draft} />
    </div>
  );
}
