import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { BudgetChoice, DietaryProfile, DietChoice } from "../../../profile/profile.types";
import { ApiError } from "../../api";
import app from "../../app.module.css";
import { fetchProfile, saveProfile } from "../../client/household-api";
import styles from "./me.module.css";
import { WordChips } from "./word-chips";

const DIETS: DietChoice[] = ["omnivore", "vegetarian", "vegan", "pescatarian", "kosher", "halal"];
const BUDGETS: BudgetChoice[] = ["low", "medium", "high"];
const EMPTY: DietaryProfile = {
  allergies: [],
  diet: null,
  dislikes: [],
  maxMinutes: null,
  budget: null,
  interests: [],
};

/** Diet, allergies, dislikes, interests, time and budget. Ideas follow it; the shared kitchen does not change. */
export function ProfileCard() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<DietaryProfile>(EMPTY);
  const [minutes, setMinutes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchProfile()
      .then((next) => {
        if (!active) {
          return;
        }

        setProfile(next);
        setMinutes(next.maxMinutes === null ? "" : String(next.maxMinutes));
      })
      .catch(() => {
        if (active) {
          setErrorCode("save_failed");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function update(next: DietaryProfile): void {
    setMessage(null);
    setProfile(next);
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setMessage(null);
    setErrorCode(null);
    const next = { ...profile, maxMinutes: minutes.trim() === "" ? null : Number(minutes) };
    void saveProfile(next)
      .then((saved) => {
        setProfile(saved);
        setMinutes(saved.maxMinutes === null ? "" : String(saved.maxMinutes));
        setMessage(t("profile.saved"));
      })
      .catch((error: unknown) => setErrorCode(error instanceof ApiError ? error.code : "save_failed"));
  }

  const error = errorCode === "bad_profile" ? t("profile.badProfile") : errorCode ? t("profile.saveFailed") : null;

  return (
    <section className={styles.section}>
      <div className={app.headerText}>
        <h2 className={app.sectionTitle}>{t("me.profile")}</h2>
        <p className={app.lead}>{t("profile.lead")}</p>
      </div>
      <form className={styles.panel} onSubmit={submit}>
        <fieldset className={styles.group}>
          <legend className={app.label}>{t("profile.diet")}</legend>
          <div className={styles.choices}>
            {DIETS.map((diet) => (
              <button
                key={diet}
                type="button"
                className={styles.choice}
                aria-pressed={profile.diet === diet}
                onClick={() => update({ ...profile, diet: profile.diet === diet ? null : diet })}
              >
                {t(`profile.diets.${diet}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <WordChips
          label={t("profile.allergies")}
          words={profile.allergies}
          tone="warn"
          onChange={(allergies) => update({ ...profile, allergies })}
        />
        <WordChips
          label={t("profile.dislikes")}
          words={profile.dislikes}
          tone="plain"
          onChange={(dislikes) => update({ ...profile, dislikes })}
        />
        <WordChips
          label={t("profile.interests")}
          words={profile.interests}
          tone="good"
          onChange={(interests) => update({ ...profile, interests })}
        />
        <div className={styles.pair}>
          <label className={styles.group}>
            <span className={app.label}>{t("profile.minutes")}</span>
            <input
              className={`${app.field} ${styles.smallField}`}
              inputMode="numeric"
              value={minutes}
              onChange={(event) => {
                setMessage(null);
                setMinutes(event.target.value);
              }}
            />
          </label>
          <fieldset className={styles.group}>
            <legend className={app.label}>{t("profile.budget")}</legend>
            <div className={styles.segmented}>
              {BUDGETS.map((budget) => (
                <button
                  key={budget}
                  type="button"
                  aria-pressed={profile.budget === budget}
                  onClick={() => update({ ...profile, budget: profile.budget === budget ? null : budget })}
                >
                  {t(`profile.budgets.${budget}`)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        {error ? <p className={app.alert}>{error}</p> : null}
        {message ? <p className={app.notice}>{message}</p> : null}
        <button className={app.dark} type="submit">
          {t("profile.save")}
        </button>
      </form>
    </section>
  );
}
