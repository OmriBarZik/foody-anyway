import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { Locale } from "../domain/domain.types";
import { englishCopy, hebrewCopy } from "./copy";

let starting: Promise<void> | null = null;

/** Start i18next with English and Hebrew before the first render. */
export async function initI18n(locale: Locale): Promise<void> {
  if (i18n.isInitialized) {
    await i18n.changeLanguage(locale);
    applyDocument(locale);

    return;
  }

  starting ??= i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: englishCopy },
        he: { translation: hebrewCopy },
      },
      lng: locale,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    })
    .then(() => {
      applyDocument(locale);
    });

  await starting;
}

/** Switch language, direction, and the saved browser preference. */
export async function applyLocale(locale: Locale): Promise<void> {
  await i18n.changeLanguage(locale);
  applyDocument(locale);

  try {
    localStorage.setItem("foody.locale", locale);
  } catch {
    // Private browsing can refuse storage. The account still keeps the language.
  }
}

/** Locale from a previous visit, then the browser language. */
export function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem("foody.locale");

    if (stored === "he" || stored === "en") {
      return stored;
    }
  } catch {
    // Private browsing can throw on localStorage. Fall through to the browser language.
  }

  if (navigator.language.toLowerCase().startsWith("he")) {
    return "he";
  }

  return "en";
}

function applyDocument(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
}

export default i18n;
