import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { BudgetChoice, DietaryProfile, DietChoice } from "../../../profile/profile.types";
import { ApiError } from "../../api";
import styles from "../../app.module.css";
import { fetchProfile, saveProfile } from "../../client/household-api";
import { WordList } from "./profile-chips";

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

/** Allergies, diet, dislikes, time, budget, and interests for the person looking. */
export function ProfileScreen() {
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
      .catch((error: unknown) => {
        setErrorCode(error instanceof ApiError ? error.code : "save_failed");
      });
  }

  const error = errorCode === "bad_profile" ? t("profile.badProfile") : errorCode ? t("profile.saveFailed") : null;

  return (
    <form className={styles.stack} onSubmit={submit}>
      <p>{t("profile.lead")}</p>
      {error ? <p className={styles.alert}>{error}</p> : null}
      {message ? <p className={styles.notice}>{message}</p> : null}
      <WordList
        label={t("profile.allergies")}
        words={profile.allergies}
        addLabel={t("profile.add")}
        onChange={(allergies) => setProfile({ ...profile, allergies })}
      />
      <WordList
        label={t("profile.dislikes")}
        words={profile.dislikes}
        addLabel={t("profile.add")}
        onChange={(dislikes) => setProfile({ ...profile, dislikes })}
      />
      <WordList
        label={t("profile.interests")}
        words={profile.interests}
        addLabel={t("profile.add")}
        onChange={(interests) => setProfile({ ...profile, interests })}
      />
      <ChoiceRow
        label={t("profile.diet")}
        value={profile.diet}
        choices={DIETS}
        noneLabel={t("profile.none")}
        labelFor={(choice) => t(`profile.diets.${choice}`)}
        onChoose={(diet) => setProfile({ ...profile, diet })}
      />
      <ChoiceRow
        label={t("profile.budget")}
        value={profile.budget}
        choices={BUDGETS}
        noneLabel={t("profile.none")}
        labelFor={(choice) => t(`profile.budgets.${choice}`)}
        onChoose={(budget) => setProfile({ ...profile, budget })}
      />
      <label className={styles.stack}>
        {t("profile.minutes")}
        <input
          className={styles.amountField}
          inputMode="numeric"
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
        />
      </label>
      <button className={styles.pineButton} type="submit">
        {t("profile.save")}
      </button>
    </form>
  );
}

function ChoiceRow<Choice extends string>({
  label,
  value,
  choices,
  noneLabel,
  labelFor,
  onChoose,
}: {
  label: string;
  value: Choice | null;
  choices: Choice[];
  noneLabel: string;
  labelFor: (choice: Choice) => string;
  onChoose: (choice: Choice | null) => void;
}) {
  return (
    <fieldset className={styles.wordList}>
      <legend>{label}</legend>
      <div className={styles.options}>
        <button type="button" className={styles.option} aria-pressed={value === null} onClick={() => onChoose(null)}>
          {noneLabel}
        </button>
        {choices.map((choice) => (
          <button
            key={choice}
            type="button"
            className={styles.option}
            aria-pressed={value === choice}
            onClick={() => onChoose(choice)}
          >
            {labelFor(choice)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
