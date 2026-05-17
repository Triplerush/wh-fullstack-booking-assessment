import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import es from "./es.json";

const stored = typeof window !== "undefined" ? window.localStorage.getItem("wh.lang") : null;

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: stored ?? "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
