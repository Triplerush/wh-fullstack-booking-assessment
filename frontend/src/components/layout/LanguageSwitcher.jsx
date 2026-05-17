import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { LANG_KEY } from "../../api/client";

const OPTIONS = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) ?? "es";

  useEffect(() => {
    document.documentElement.lang = current;
  }, [current]);

  function switchTo(code) {
    if (code === current) return;
    void i18n.changeLanguage(code);
    localStorage.setItem(LANG_KEY, code);
    document.documentElement.lang = code;
  }

  return (
    <div role="group" aria-label="language" style={{ display: "flex", gap: 0 }}>
      {OPTIONS.map((opt, i) => {
        const active = opt.code === current;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => switchTo(opt.code)}
            aria-pressed={active}
            style={{
              padding: "var(--space-1) var(--space-3)",
              minHeight: 32,
              background: active ? "var(--color-brand)" : "var(--color-surface)",
              color: active ? "#fff" : "var(--color-text)",
              border: "1px solid var(--color-border)",
              borderLeft: i === 0 ? "1px solid var(--color-border)" : "0",
              borderRadius:
                i === 0
                  ? "var(--radius-sm) 0 0 var(--radius-sm)"
                  : "0 var(--radius-sm) var(--radius-sm) 0",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.85rem",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
