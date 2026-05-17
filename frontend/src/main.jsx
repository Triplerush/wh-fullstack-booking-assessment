import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppRouter } from "./routes/AppRouter";
import "./i18n";
import "./styles/global.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing #root element in index.html");
}

createRoot(root).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
