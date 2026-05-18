import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { ToastStack } from "../ui/Toast";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppShell({ children }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const apply = () => {
      const code = (i18n.language || "es").slice(0, 2);
      document.documentElement.lang = code;
    };
    apply();
    i18n.on("languageChanged", apply);
    return () => i18n.off("languageChanged", apply);
  }, [i18n]);

  return (
    <div className="app-shell">
      <Header />
      <main>{children}</main>
      <Footer />
      <ToastStack />
    </div>
  );
}
