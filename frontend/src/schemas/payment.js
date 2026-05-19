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
    expiry: z.string().regex(/^\d{2}\/\d{2}$/, t("validation.expiry")),
    cvv: z.string().regex(/^\d{3,4}$/, t("validation.cvv")),
    cardholder: z.string().min(2, t("validation.required")),
    accept_terms: z.literal(true, {
      errorMap: () => ({ message: t("validation.acceptTerms") }),
    }),
  });
}
