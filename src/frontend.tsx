import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { App } from "./shell/app";
import i18n, { initI18n, readStoredLocale } from "./shell/i18n";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Foody could not find the page root.");
}

const initialLocale = readStoredLocale();
await initI18n(initialLocale);

const app = (
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </StrictMode>
);

type HotData = { root?: Root };
((import.meta.hot.data as HotData).root ??= createRoot(rootElement)).render(app);
