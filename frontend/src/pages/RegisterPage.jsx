import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { FormError } from "../components/forms/FormError";
import { TextInput } from "../components/forms/TextInput";
import { useAuth } from "../context/AuthContext";
import { applyDrfErrorsToForm } from "../utils/apiErrors";

const FIELDS = [
  "email",
  "password",
  "full_name",
  "nationality",
  "phone_country_code",
  "phone_number",
  "birth_date",
];

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);

  // Schema reactivo al idioma.
  const registerSchema = useMemo(
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
  } = useForm({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    setBanner(null);
    clearErrors();
    if (isSubmitted) trigger();
  }, [i18n.language]);

  async function onSubmit(values) {
    setBanner(null);
    try {
      await doRegister(values);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = applyDrfErrorsToForm(err, setError, FIELDS, t);
      if (msg) setBanner(msg);
    }
  }

  return (
    <div className="form-page solo">
      <section>
        <h1 className="form-title">{t("auth.register.title")}</h1>
        <p className="form-intro">{t("auth.register.intro")}</p>
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
            style={{ marginTop: 16 }}
          >
            {isSubmitting ? t("auth.submitting") : t("auth.register.submit")}
          </button>
        </form>
        <p style={{ marginTop: 24, fontSize: 13 }}>
          {t("auth.register.hasAccount")}{" "}
          <Link to="/login" style={{ fontWeight: 800, textDecoration: "underline" }}>
            {t("nav.login")}
          </Link>
        </p>
      </section>
    </div>
  );
}
