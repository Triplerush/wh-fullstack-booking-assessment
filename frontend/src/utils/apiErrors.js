export function applyDrfErrorsToForm(error, setError, fieldNames) {
  const data = error?.response?.data;
  if (!data || typeof data !== "object") {
    return "Unexpected error.";
  }
  let banner = null;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    banner = data.non_field_errors.join(" ");
  } else if (data.detail) {
    banner = String(data.detail);
  }
  for (const field of fieldNames) {
    const messages = data[field];
    if (Array.isArray(messages) && messages.length) {
      setError(field, { type: "server", message: messages.join(" ") });
    }
  }
  return banner;
}
