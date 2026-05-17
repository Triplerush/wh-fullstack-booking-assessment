import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { TextInput } from "../components/forms/TextInput";
import { FormError } from "../components/forms/FormError";
import { useAuth } from "../context/AuthContext";
import { applyDrfErrorsToForm } from "../utils/apiErrors";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Za-z]/, "Debe incluir una letra")
    .regex(/\d/, "Debe incluir un dígito"),
  full_name: z.string().min(2, "Requerido"),
  nationality: z.string().min(2, "Requerido"),
  phone_country_code: z
    .string()
    .regex(/^\+\d{1,4}$/, "Formato: +34"),
  phone_number: z.string().regex(/^\d{6,15}$/, "Solo dígitos (6–15)"),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato AAAA-MM-DD"),
});

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
  const { t } = useTranslation();
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values) {
    setBanner(null);
    try {
      await doRegister(values);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = applyDrfErrorsToForm(err, setError, FIELDS);
      if (msg) setBanner(msg);
    }
  }

  return (
    <section style={{ maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ marginBottom: "var(--space-5)" }}>{t("auth.register.title")}</h2>
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
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <div style={{ flex: "0 0 110px" }}>
            <TextInput
              label={t("auth.phoneCountry")}
              placeholder="+34"
              {...register("phone_country_code")}
              error={errors.phone_country_code?.message}
            />
          </div>
          <div style={{ flex: 1 }}>
            <TextInput
              label={t("auth.phoneNumber")}
              inputMode="numeric"
              {...register("phone_number")}
              error={errors.phone_number?.message}
            />
          </div>
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
          style={{
            marginTop: "var(--space-4)",
            padding: "var(--space-3) var(--space-5)",
            minHeight: "44px",
            background: "var(--color-brand)",
            color: "#fff",
            border: 0,
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
          }}
        >
          {isSubmitting ? t("auth.submitting") : t("auth.register.submit")}
        </button>
      </form>
      <p style={{ marginTop: "var(--space-4)" }}>
        {t("auth.register.hasAccount")} <Link to="/login">{t("nav.login")}</Link>
      </p>
    </section>
  );
}
