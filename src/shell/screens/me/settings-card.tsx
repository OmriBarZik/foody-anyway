import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Locale, MeasurementSystem, UserView } from "../../../domain/domain.types";
import { signOut, updateMe } from "../../api";
import app from "../../app.module.css";
import { applyLocale } from "../../i18n";
import { ForwardIcon } from "../shell/icons";
import styles from "./me.module.css";

/** Language, measurements, the owner's cost page, and sign-out. */
export function SettingsCard({
  user,
  go,
  onUser,
  onRefresh,
}: {
  user: UserView;
  go: (path: string) => void;
  onUser: (user: UserView) => void;
  onRefresh: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  async function onLocale(locale: Locale): Promise<void> {
    const previous = user.locale;
    setFailed(false);
    await applyLocale(locale);

    try {
      onUser(await updateMe({ locale }));
    } catch {
      setFailed(true);
      await applyLocale(previous);
    }
  }

  async function onMeasurement(measurement: MeasurementSystem): Promise<void> {
    setFailed(false);

    try {
      onUser(await updateMe({ measurement }));
    } catch {
      setFailed(true);
    }
  }

  async function onSignOut(): Promise<void> {
    await signOut();
    go("/");
    await onRefresh();
  }

  return (
    <section className={styles.section}>
      <h2 className={app.sectionTitle}>{t("me.settings")}</h2>
      {failed ? (
        <p className={app.alert} role="alert">
          {t("settings.failed")}
        </p>
      ) : null}
      <div className={`${app.card} ${styles.settings}`}>
        <div className={app.row}>
          <span className={app.rowTitle}>{t("settings.language")}</span>
          <div className={styles.toggle} role="group" aria-label={t("settings.language")}>
            <button type="button" aria-pressed={user.locale === "en"} onClick={() => void onLocale("en")}>
              {t("settings.english")}
            </button>
            <button type="button" lang="he" aria-pressed={user.locale === "he"} onClick={() => void onLocale("he")}>
              {t("settings.hebrew")}
            </button>
          </div>
        </div>
        <div className={app.row}>
          <span className={app.rowTitle}>{t("settings.measurement")}</span>
          <div className={styles.toggle} role="group" aria-label={t("settings.measurement")}>
            <button
              type="button"
              aria-pressed={user.measurement === "metric"}
              onClick={() => void onMeasurement("metric")}
            >
              {t("settings.metric")}
            </button>
            <button
              type="button"
              aria-pressed={user.measurement === "imperial"}
              onClick={() => void onMeasurement("imperial")}
            >
              {t("settings.imperial")}
            </button>
          </div>
        </div>
        {user.isAdmin ? (
          <a
            href="/costs"
            className={`${app.row} ${styles.link}`}
            onClick={(event) => {
              event.preventDefault();
              go("/costs");
            }}
          >
            <span className={app.rowText}>
              <span className={app.rowTitle}>{t("me.costs")}</span>
            </span>
            <span className={app.rowSub}>{t("me.ownerOnly")}</span>
            <span className={styles.flip}>
              <ForwardIcon size={18} />
            </span>
          </a>
        ) : null}
        <button type="button" className={`${app.row} ${styles.signOut}`} onClick={() => void onSignOut()}>
          {t("settings.signOut")}
        </button>
      </div>
    </section>
  );
}
