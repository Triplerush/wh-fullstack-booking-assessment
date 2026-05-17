export function formatPrice(amount, currency = "USD", locale = "es") {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (_e) {
    return `${value} ${currency}`;
  }
}
