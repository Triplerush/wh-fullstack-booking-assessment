import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { TextInput } from "../components/forms/TextInput";
import { FormError } from "../components/forms/FormError";
import { useAuth } from "../context/AuthContext";
import { applyDrfErrorsToForm } from "../utils/apiErrors";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Requerido"),
});

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") ?? "/";
  const [banner, setBanner] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values) {
    setBanner(null);
    try {
      await login(values.email, values.password);
      navigate(next, { replace: true });
    } catch (err) {
      const msg = applyDrfErrorsToForm(err, setError, ["email", "password"]);
      setBanner(msg ?? t("auth.invalidCredentials"));
    }
  }

  return (
    <section style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2 style={{ marginBottom: "var(--space-5)" }}>{t("auth.login.title")}</h2>
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
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
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
          {isSubmitting ? t("auth.submitting") : t("auth.login.submit")}
        </button>
      </form>
      <p style={{ marginTop: "var(--space-4)" }}>
        {t("auth.login.noAccount")} <Link to="/register">{t("nav.register")}</Link>
      </p>
    </section>
  );
}
