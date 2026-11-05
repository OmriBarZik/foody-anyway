import { useTranslation } from "react-i18next";
import type { Locale, MeasurementSystem, UserView } from "../../domain/domain.types";
import styles from "../app.module.css";
import type { InviteButtonState } from "../shell.types";

/** Kitchen name and the controls that belong to the person, not the stock. */
export function TopBar({
  user,
  inviteState,
  onLocale,
  onMeasurement,
  onInvite,
  onSignOut,
}: {
  user: UserView;
  inviteState: InviteButtonState;
  onLocale: (locale: Locale) => void;
  onMeasurement: (measurement: MeasurementSystem) => void;
  onInvite: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const inviteLabel =
    inviteState === "copied"
      ? t("invite.copied")
      : inviteState === "failed"
        ? t("invite.copyFailed")
        : t("invite.create");

  return (
    <header className={styles.top}>
      <div>
        <h1 className={styles.brand}>{t("kitchen")}</h1>
        <div className={styles.brandRule} />
        <p className={styles.household}>{user.household.name}</p>
      </div>
      <div className={styles.controls}>
        {user.pictureUrl ? <img className={styles.picture} src={user.pictureUrl} alt="" /> : null}
        <button
          type="button"
          className={styles.choice}
          aria-pressed={user.locale === "en"}
          onClick={() => onLocale("en")}
        >
          {t("settings.english")}
        </button>
        <button
          type="button"
          className={styles.choice}
          aria-pressed={user.locale === "he"}
          onClick={() => onLocale("he")}
        >
          {t("settings.hebrew")}
        </button>
        <button
          type="button"
          className={styles.choice}
          aria-pressed={user.measurement === "metric"}
          onClick={() => onMeasurement("metric")}
        >
          {t("settings.metric")}
        </button>
        <button
          type="button"
          className={styles.choice}
          aria-pressed={user.measurement === "imperial"}
          onClick={() => onMeasurement("imperial")}
        >
          {t("settings.imperial")}
        </button>
        <button type="button" className={styles.textButton} onClick={onInvite}>
          {inviteLabel}
        </button>
        <button type="button" className={styles.textButton} onClick={onSignOut}>
          {t("settings.signOut")}
        </button>
      </div>
    </header>
  );
}
