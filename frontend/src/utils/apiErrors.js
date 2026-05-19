export function translateError(raw, t) {
  const str = String(raw ?? "");
  if (!str) return "";
  const idx = str.indexOf(":");
  const code = idx >= 0 ? str.slice(0, idx) : str;
  const value = idx >= 0 ? str.slice(idx + 1) : undefined;
  if (!/^[a-z][a-z0-9_]*$/i.test(code)) return str;
  if (!t) return str;
  return t(`errors.${code}`, { value, defaultValue: str });
}

export function translateErrorList(messages, t) {
  if (!Array.isArray(messages) || !messages.length) return "";
  return messages.map((m) => translateError(m, t)).join(" ");
}

export function applyDrfErrorsToForm(error, setError, fieldNames, t) {
  const data = error?.response?.data;
  if (!data || typeof data !== "object") {
    return null;
  }
  let banner = null;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    banner = data.non_field_errors.map((m) => translateError(m, t)).join(" ");
  } else if (data.detail) {
    banner = translateError(String(data.detail), t);
  }

  const orphan = [];
  for (const [key, messages] of Object.entries(data)) {
    if (key === "non_field_errors" || key === "detail") continue;
    if (!Array.isArray(messages) || !messages.length) continue;
    const translated = messages.map((m) => translateError(m, t)).join(" ");
    if (fieldNames.includes(key)) {
      setError(key, { type: "server", message: translated });
    } else {
      orphan.push(translated);
    }
  }
  if (!banner && orphan.length) {
    banner = orphan.join(" ");
  }
  return banner;
}

export function getErrorCode(error) {
  const data = error?.response?.data;
  if (!data || typeof data !== "object") return null;
  const list = data.non_field_errors;
  if (!Array.isArray(list) || !list.length) return null;
  const raw = String(list[0] ?? "");
  const idx = raw.indexOf(":");
  const code = idx >= 0 ? raw.slice(0, idx) : raw;
  return /^[a-z][a-z0-9_]*$/i.test(code) ? code : null;
}
