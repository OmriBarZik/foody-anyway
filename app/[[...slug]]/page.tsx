"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";

import { App } from "../../src/shell/app";
import i18n, { initI18n, readStoredLocale } from "../../src/shell/i18n";

/** The kitchen shell. The path still decides the screen inside the client. */
export default function KitchenPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void initI18n(readStoredLocale()).then(() => {
      setReady(true);
    });
  }, []);

  if (!ready) {
    return <main />;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  );
}
