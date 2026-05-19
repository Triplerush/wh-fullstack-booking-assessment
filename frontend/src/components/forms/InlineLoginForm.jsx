import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { useAuth } from "../../context/AuthContext";
import { applyDrfErrorsToForm } from "../../utils/apiErrors";
import { FormError } from "./FormError";
import { TextInput } from "./TextInput";

const FIELDS = ["email", "password"];

export function InlineLoginForm({ onSuccess, onSwitchToRegister }) {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [banner, setBanner] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Schema reactivo al idioma; useMemo lo reconstruye al cambiar el locale.
  const schema = useMemo(
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
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setBanner(null);
    try {
      await login(values.email, values.password);
      onSuccess?.();
    } catch (err) {
      const msg = applyDrfErrorsToForm(err, setError, FIELDS, t);
      setBanner(msg ?? t("auth.invalidCredentials"));
    }
  }

  return (
    <section style={{ marginBottom: 28 }}>
      <h2 className="form-title small">{t("auth.login.inlineTitle")}</h2>
      <p className="form-intro">{t("auth.login.inlineIntro")}</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextInput
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <div className="password-wrapper">
          <TextInput
            label={t("auth.password")}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password")}
            error={errors.password?.message}
          />
          {/* Botón ojo para mostrar/ocultar la contraseña, idéntico al
              .toggle-button del MHTML real. */}
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            aria-pressed={showPassword}
            tabIndex={-1}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M1.32 11.45C2.81 6.98 7.03 3.75 12 3.75c4.97 0 9.19 3.22 10.68 7.69.12.36.12.75 0 1.11-1.49 4.47-5.7 7.7-10.68 7.7-4.97 0-9.19-3.22-10.68-7.69a1.76 1.76 0 010-1.11zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" />
            </svg>
          </button>
        </div>
        <FormError>{banner}</FormError>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-block"
          style={{ marginTop: 12 }}
        >
          {isSubmitting ? t("auth.submitting") : t("auth.login.submit")}
        </button>
      </form>

      {/* Link "¿No tienes cuenta? Regístrate" — el padre intercepta el
          callback para cambiar al InlineRegisterForm sin remontar nada
          más. */}
      <div className="inline-auth-switch">
        <button type="button" onClick={onSwitchToRegister} className="link-button">
          {t("auth.login.noAccount")}{" "}
          <span className="link-button-strong">{t("auth.register.submit")}</span>
        </button>
      </div>
    </section>
  );
}
