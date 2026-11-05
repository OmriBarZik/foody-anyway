import { useTranslation } from "react-i18next";
import type { Locale } from "../../domain/domain.types";
import { applyLocale } from "../i18n";
import styles from "../app.module.css";
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
  const next = route.name === "invite" ? `/invite/${encodeURIComponent(route.token)}` : "";
  const href = next ? `/api/auth/google?next=${encodeURIComponent(next)}` : "/api/auth/google";

  return (
    <main className={styles.page}>
      <h1 className={styles.brand}>Foody</h1>
      <div className={styles.brandRule} />
      <p className={styles.lead}>{t("signIn.lead")}</p>
      {route.name === "invite" ? <p>{t("signIn.invite")}</p> : null}
      {route.authError === "failed" ? <p className={styles.alert}>{t("signIn.failed")}</p> : null}
      {route.authError === "unconfigured" || !google ? <p>{t("signIn.unconfigured")}</p> : null}
      {loadError ? (
        <p>
          {t("status.loadFailed")}{" "}
          <button className={styles.textButton} type="button" onClick={onRetry}>
            {t("status.retry")}
          </button>
        </p>
      ) : null}
      {google ? (
        <a className={styles.pineButton} href={href}>
          {t("signIn.button")}
        </a>
      ) : (
        <button className={styles.pineButton} type="button" disabled>
          {t("signIn.button")}
        </button>
      )}
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.choice}
          aria-pressed={locale === "en"}
          onClick={() => void applyLocale("en")}
        >
          {t("settings.english")}
        </button>
        <button
          type="button"
          className={styles.choice}
          aria-pressed={locale === "he"}
          onClick={() => void applyLocale("he")}
        >
          {t("settings.hebrew")}
        </button>
      </div>
    </main>
  );
}
