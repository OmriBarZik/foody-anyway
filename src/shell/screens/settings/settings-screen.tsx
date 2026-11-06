import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Locale, MeasurementSystem, UserView } from "../../../domain/domain.types";
import { createInvite, signOut, updateMe } from "../../api";
import styles from "../../app.module.css";
import { applyLocale } from "../../i18n";
import type { InviteButtonState } from "../../shell.types";

/** Language, measurements, an invite link, and sign-out. */
export function SettingsScreen({
  user,
  onUser,
  go,
  onRefresh,
}: {
  user: UserView;
  onUser: (user: UserView) => void;
  go: (path: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const [inviteState, setInviteState] = useState<InviteButtonState>("idle");
  const inviteLabel =
    inviteState === "copied"
      ? t("invite.copied")
      : inviteState === "failed"
        ? t("invite.copyFailed")
        : t("invite.create");

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

  async function onInvite(): Promise<void> {
    setInviteState("idle");

    try {
      const link = await createInvite();
      await navigator.clipboard.writeText(link.url);
      setInviteState("copied");
    } catch {
      setInviteState("failed");
    }
  }

  async function onSignOut(): Promise<void> {
    await signOut();
    go("/");
    await onRefresh();
  }

  return (
    <section className={styles.stack}>
      <h2 className={styles.sectionTitle}>{t("settings.title")}</h2>
      <div className={styles.person}>
        {user.pictureUrl ? <img className={styles.picture} src={user.pictureUrl} alt="" /> : null}
        <div>
          <p className={styles.personName}>{user.name}</p>
          <p className={styles.personMail}>{user.email}</p>
        </div>
      </div>
      {failed ? (
        <p className={styles.alert} role="alert">
          {t("settings.failed")}
        </p>
      ) : null}
      <fieldset className={styles.wordList}>
        <legend>{t("settings.language")}</legend>
        <div className={styles.options}>
          <button
            type="button"
            className={styles.option}
            aria-pressed={user.locale === "en"}
            onClick={() => void onLocale("en")}
          >
            {t("settings.english")}
          </button>
          <button
            type="button"
            className={styles.option}
            aria-pressed={user.locale === "he"}
            onClick={() => void onLocale("he")}
          >
            {t("settings.hebrew")}
          </button>
        </div>
      </fieldset>
      <fieldset className={styles.wordList}>
        <legend>{t("settings.measurement")}</legend>
        <div className={styles.options}>
          <button
            type="button"
            className={styles.option}
            aria-pressed={user.measurement === "metric"}
            onClick={() => void onMeasurement("metric")}
          >
            {t("settings.metric")}
          </button>
          <button
            type="button"
            className={styles.option}
            aria-pressed={user.measurement === "imperial"}
            onClick={() => void onMeasurement("imperial")}
          >
            {t("settings.imperial")}
          </button>
        </div>
      </fieldset>
      <button type="button" className={styles.pineButton} onClick={() => void onInvite()}>
        {inviteLabel}
      </button>
      <button type="button" className={styles.textButton} onClick={() => void onSignOut()}>
        {t("settings.signOut")}
      </button>
    </section>
  );
}
