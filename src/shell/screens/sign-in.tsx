import { useTranslation } from "react-i18next";
import type { Locale } from "../../domain/domain.types";
import { signInWithGoogle } from "../api";
import app from "../app.module.css";
import styles from "./sign-in.module.css";
import { applyLocale } from "../i18n";
import type { AppRoute } from "../shell.types";

/** The first screen: what Foody is, and Google sign-in. */
export function SignIn({
  google,
  route,
  loadError,
  onRetry,
}: {
  google: boolean;
  route: AppRoute;
  loadError: boolean;
  onRetry: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language === "he" ? "he" : "en";
  const callbackURL = route.name === "invite" ? `/invite/${encodeURIComponent(route.token)}` : "/";

  return (
    <main className={styles.screen}>
      <div className={styles.top}>
        <span className={styles.wordmark}>foody</span>
        <div className={styles.languages}>
          <button type="button" aria-pressed={locale === "en"} onClick={() => void applyLocale("en")}>
            {t("settings.english")}
          </button>
          <button type="button" lang="he" aria-pressed={locale === "he"} onClick={() => void applyLocale("he")}>
            {t("settings.hebrew")}
          </button>
        </div>
      </div>
      <div className={styles.art} aria-hidden="true">
        <span className={styles.blobRound} />
        <span className={styles.blobPeach} />
        <span className={styles.blobInk} />
      </div>
      <div className={styles.body}>
        <h1 className={styles.headline}>{t("signIn.headline")}</h1>
        <p className={styles.lead}>{t("signIn.lead")}</p>
        {route.name === "invite" ? <p className={styles.note}>{t("signIn.invite")}</p> : null}
        {route.authError === "failed" ? <p className={app.alert}>{t("signIn.failed")}</p> : null}
        {route.authError === "unconfigured" || !google ? (
          <p className={styles.note}>{t("signIn.unconfigured")}</p>
        ) : null}
        {loadError ? (
          <p className={styles.note}>
            {t("status.loadFailed")}{" "}
            <button className={styles.retry} type="button" onClick={onRetry}>
              {t("status.retry")}
            </button>
          </p>
        ) : null}
        <button
          className={`${app.dark} ${styles.google}`}
          type="button"
          disabled={!google}
          onClick={() => void signInWithGoogle(callbackURL)}
        >
          <GoogleMark />
          {t("signIn.button")}
        </button>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg className={styles.googleMark} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 41.2 44 36 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
