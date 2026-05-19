import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { FormError } from "../components/forms/FormError";
import { TextInput } from "../components/forms/TextInput";
import { useAuth } from "../context/AuthContext";
import { applyDrfErrorsToForm } from "../utils/apiErrors";

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") ?? "/";
  const [banner, setBanner] = useState(null);

  // Schema reactivo al idioma.
  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("validation.email")),
        password: z.string().min(1, t("validation.required")),
      }),
    [t, i18n.language],
  );

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
      const msg = applyDrfErrorsToForm(err, setError, ["email", "password"], t);
      setBanner(msg ?? t("auth.invalidCredentials"));
    }
  }

  return (
    <div className="form-page solo">
      <section>
        <h1 className="form-title">{t("auth.login.title")}</h1>
        <p className="form-intro">{t("auth.login.intro")}</p>
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
            className="btn btn-block"
            style={{ marginTop: 16 }}
          >
            {isSubmitting ? t("auth.submitting") : t("auth.login.submit")}
          </button>
        </form>
        <p style={{ marginTop: 24, fontSize: 13 }}>
          {t("auth.login.noAccount")}{" "}
          <Link to="/register" style={{ fontWeight: 800, textDecoration: "underline" }}>
            {t("auth.register.submit")}
          </Link>
        </p>
      </section>
    </div>
  );
}
