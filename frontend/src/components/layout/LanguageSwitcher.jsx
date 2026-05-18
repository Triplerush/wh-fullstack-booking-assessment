import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { LANG_KEY } from "../../api/client";

const OPTIONS = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.slice(0, 2) ?? "es";

  function switchTo(code) {
    if (code === current) return;
    void i18n.changeLanguage(code);
    localStorage.setItem(LANG_KEY, code);
  }

  return (
    <div role="group" aria-label="language" className="lang-group">
      {OPTIONS.map((opt, idx) => (
        <Fragment key={opt.code}>
          {idx > 0 ? <span className="sep" aria-hidden="true">/</span> : null}
          <button
            type="button"
            onClick={() => switchTo(opt.code)}
            aria-pressed={opt.code === current}
          >
            {opt.label}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
