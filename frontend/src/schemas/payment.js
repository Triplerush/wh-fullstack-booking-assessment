import { z } from "zod";

// Esquema del formulario de pago simulado. NO se envía al backend.
export const mockPaymentSchema = z.object({
  card_number: z.string().regex(/^\d{13,19}$/, "Número de tarjeta inválido"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Formato MM/AA"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
  cardholder: z.string().min(2, "Requerido"),
  accept_terms: z.literal(true, { errorMap: () => ({ message: "Debes aceptar las condiciones" }) }),
});
