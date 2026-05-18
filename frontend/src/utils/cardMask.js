// Formatea la fecha de expiración de tarjeta como "MM/AA" mientras el usuario escribe.
export function formatExpiry(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// Formatea el número de tarjeta en bloques de 4 dígitos separados por espacios.
export function formatCardNumber(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}
