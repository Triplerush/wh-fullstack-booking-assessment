import { z } from "zod";

// Schema como factory: recibe la función `t` de i18n para resolver los
// mensajes en el idioma activo. Los consumidores lo envuelven en useMemo
// dependiente de i18n.language.
export function createPaymentSchema(t) {
  return z.object({
    card_number: z
      .string()
      .transform((s) => s.replace(/\s+/g, ""))
      .pipe(z.string().regex(/^\d{13,19}$/, t("validation.cardNumber"))),
    expiry: z
      .string()
      .regex(/^\d{2}\/\d{2}$/, t("validation.expiry"))
      .superRefine((value, ctx) => {
        const [mmStr, yyStr] = value.split("/");
        const mm = Number(mmStr);
        const yy = Number(yyStr);
        // Mes válido 01–12. Rechaza basura como "99/99" o "00/30".
        if (!(mm >= 1 && mm <= 12)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.expiryMonth"),
          });
          return;
        }
        // Año en formato YY: comparamos con la fecha actual. Una tarjeta es
        // válida durante todo el mes de caducidad → comparamos contra el
        // primer día del mes siguiente.
        const now = new Date();
        const currentYY = now.getFullYear() % 100;
        const currentMM = now.getMonth() + 1;
        const isPast = yy < currentYY || (yy === currentYY && mm < currentMM);
        if (isPast) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("validation.expiryPast"),
          });
        }
      }),
    cvv: z.string().regex(/^\d{3,4}$/, t("validation.cvv")),
    cardholder: z.string().min(2, t("validation.required")),
    accept_terms: z.literal(true, {
      errorMap: () => ({ message: t("validation.acceptTerms") }),
    }),
  });
}
