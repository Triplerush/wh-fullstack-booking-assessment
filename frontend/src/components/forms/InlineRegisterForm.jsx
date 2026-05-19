import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { useAuth } from "../../context/AuthContext";
import { applyDrfErrorsToForm } from "../../utils/apiErrors";
import { FormError } from "./FormError";
import { TextInput } from "./TextInput";

const FIELDS = [
  "email",
  "password",
  "full_name",
  "nationality",
  "phone_country_code",
  "phone_number",
  "birth_date",
];

export function InlineRegisterForm({ onSuccess }) {
  const { t, i18n } = useTranslation();
  const { register: doRegister } = useAuth();
  const [banner, setBanner] = useState(null);

  // Schema reactivo al idioma; useMemo lo reconstruye al cambiar el locale.
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("validation.email")),
        password: z
          .string()
          .min(8, t("validation.passwordMin"))
          .regex(/[A-Za-z]/, t("validation.passwordLetter"))
          .regex(/\d/, t("validation.passwordDigit")),
        full_name: z.string().min(2, t("validation.required")),
        nationality: z.string().min(2, t("validation.required")),
        phone_country_code: z.string().regex(/^\+\d{1,4}$/, t("validation.phoneCountry")),
        phone_number: z.string().regex(/^\d{6,15}$/, t("validation.phoneNumber")),
        birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t("validation.birthDate")),
      }),
    [t, i18n.language],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
    setError,
    clearErrors,
    trigger,
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    setBanner(null);
    clearErrors();
    if (isSubmitted) trigger();
  }, [i18n.language]);

  async function onSubmit(values) {
    setBanner(null);
    try {
      await doRegister(values);
      onSuccess?.();
    } catch (err) {
      const msg = applyDrfErrorsToForm(err, setError, FIELDS, t);
      if (msg) setBanner(msg);
    }
  }

  return (
    <section style={{ marginBottom: 28 }}>
      <h2 className="form-title small">{t("checkout.guest.title")}</h2>
      <p className="form-intro">{t("checkout.guest.subtitle")}</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextInput
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <TextInput
          label={t("auth.password")}
          type="password"
          autoComplete="new-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <TextInput
          label={t("auth.fullName")}
          autoComplete="name"
          {...register("full_name")}
          error={errors.full_name?.message}
        />
        <TextInput
          label={t("auth.nationality")}
          {...register("nationality")}
          error={errors.nationality?.message}
        />
        <div className="form-grid">
          <TextInput
            label={t("auth.phoneCountry")}
            placeholder="+34"
            {...register("phone_country_code")}
            error={errors.phone_country_code?.message}
          />
          <TextInput
            label={t("auth.phoneNumber")}
            inputMode="numeric"
            {...register("phone_number")}
            error={errors.phone_number?.message}
          />
        </div>
        <TextInput
          label={t("auth.birthDate")}
          type="date"
          {...register("birth_date")}
          error={errors.birth_date?.message}
        />
        <FormError>{banner}</FormError>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-block"
          style={{ marginTop: 12 }}
        >
          {isSubmitting ? t("auth.submitting") : t("checkout.guest.submit")}
        </button>
      </form>
    </section>
  );
}
