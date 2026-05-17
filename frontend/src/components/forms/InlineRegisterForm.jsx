import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { useAuth } from "../../context/AuthContext";
import { applyDrfErrorsToForm } from "../../utils/apiErrors";
import { FormError } from "./FormError";
import { TextInput } from "./TextInput";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Za-z]/, "Debe incluir una letra")
    .regex(/\d/, "Debe incluir un dígito"),
  full_name: z.string().min(2, "Requerido"),
  nationality: z.string().min(2, "Requerido"),
  phone_country_code: z.string().regex(/^\+\d{1,4}$/, "Formato: +34"),
  phone_number: z.string().regex(/^\d{6,15}$/, "Solo dígitos (6–15)"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato AAAA-MM-DD"),
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

export function InlineRegisterForm({ onSuccess }) {
  const { t } = useTranslation();
  const { register: doRegister } = useAuth();
  const [banner, setBanner] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setBanner(null);
    try {
      await doRegister(values);
      onSuccess?.();
    } catch (err) {
      const msg = applyDrfErrorsToForm(err, setError, FIELDS);
      if (msg) setBanner(msg);
    }
  }

  return (
    <section
      style={{
        padding: "var(--space-4)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        marginBottom: "var(--space-5)",
      }}
    >
      <h3 style={{ marginBottom: "var(--space-2)" }}>{t("checkout.guest.title")}</h3>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-3)" }}>
        {t("checkout.guest.subtitle")}
      </p>
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
            marginTop: "var(--space-3)",
            padding: "var(--space-3) var(--space-5)",
            minHeight: 44,
            background: "var(--color-brand)",
            color: "#fff",
            border: 0,
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
          }}
        >
          {isSubmitting ? t("auth.submitting") : t("checkout.guest.submit")}
        </button>
      </form>
    </section>
  );
}
