import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { RecipeView } from "../../../domain/domain.types";
import { ApiError } from "../../api";
import app from "../../app.module.css";
import { saveManualRecipe } from "../../client/household-api";
import { useKeyboardInset } from "../../use-keyboard-inset";
import { CloseIcon } from "../shell/icons";
import { IngredientRows, StepRows } from "./line-rows";
import type { DraftIngredient, DraftStep } from "./new-recipe.types";
import styles from "./new-recipe.module.css";

/** A recipe typed in by hand: name, time, servings, ingredients, steps, and where it came from. */
export function NewRecipeScreen({
  go,
  onCreated,
}: {
  go: (path: string) => void;
  onCreated: (recipe: RecipeView) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [ingredients, setIngredients] = useState<DraftIngredient[]>(() => [blankIngredient(), blankIngredient()]);
  const [steps, setSteps] = useState<DraftStep[]>(() => [blankStep()]);
  const [saving, setSaving] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const keyboardInset = useKeyboardInset();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const filledIngredients = ingredients.filter((line) => line.name.trim());
    const filledSteps = steps.filter((step) => step.text.trim());

    if (!title.trim() || (filledIngredients.length === 0 && filledSteps.length === 0)) {
      setErrorCode("bad_recipe");

      return;
    }

    setSaving(true);
    setErrorCode(null);

    try {
      const recipe = await saveManualRecipe({
        title,
        cookTime: cookTime || null,
        servings: servings || null,
        sourceNote: sourceNote || null,
        ingredients: filledIngredients.map((line) => ({ amount: line.amount, name: line.name })),
        steps: filledSteps.map((step) => step.text),
      });
      onCreated(recipe);
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : "save_failed");
      setSaving(false);
    }
  }

  return (
    <div className={styles.screen}>
      <header className={styles.top}>
        <a
          href="/"
          className={app.iconButton}
          aria-label={t("newRecipe.close")}
          onClick={(event) => {
            event.preventDefault();
            go("/");
          }}
        >
          <CloseIcon size={20} strokeWidth={2.4} />
        </a>
        <h1 className={styles.heading}>{t("newRecipe.title")}</h1>
      </header>
      <form id="new-recipe" className={styles.form} onSubmit={(event) => void submit(event)} noValidate>
        <label className={styles.field}>
          <span className={app.label}>{t("newRecipe.name")}</span>
          <input
            className={app.field}
            value={title}
            placeholder={t("newRecipe.namePlaceholder")}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <div className={styles.pair}>
          <label className={styles.field}>
            <span className={app.label}>{t("newRecipe.time")}</span>
            <input
              className={app.field}
              value={cookTime}
              placeholder={t("newRecipe.timePlaceholder")}
              onChange={(event) => setCookTime(event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={app.label}>{t("newRecipe.servings")}</span>
            <input
              className={app.field}
              inputMode="numeric"
              value={servings}
              placeholder={t("newRecipe.servingsPlaceholder")}
              onChange={(event) => setServings(event.target.value)}
            />
          </label>
        </div>
        <IngredientRows
          lines={ingredients}
          onChange={setIngredients}
          onAdd={() => setIngredients([...ingredients, blankIngredient()])}
        />
        <StepRows steps={steps} onChange={setSteps} onAdd={() => setSteps([...steps, blankStep()])} />
        <label className={styles.field}>
          <span className={app.label}>
            {t("newRecipe.source")} <span className={styles.optional}>{t("newRecipe.optional")}</span>
          </span>
          <input
            className={app.field}
            value={sourceNote}
            placeholder={t("newRecipe.sourcePlaceholder")}
            onChange={(event) => setSourceNote(event.target.value)}
          />
        </label>
        {errorCode ? (
          <p className={app.alert} role="alert">
            {errorCode === "bad_recipe" ? t("newRecipe.bad") : t("newRecipe.failed")}
          </p>
        ) : null}
      </form>
      <div
        className={styles.saveBar}
        data-keyboard={keyboardInset > 0 ? "open" : undefined}
        style={{ bottom: keyboardInset }}
      >
        <button type="submit" form="new-recipe" className={`${app.primary} ${styles.save}`} disabled={saving}>
          {saving ? t("newRecipe.saving") : t("newRecipe.save")}
        </button>
      </div>
    </div>
  );
}

function blankIngredient(): DraftIngredient {
  return { id: crypto.randomUUID(), amount: "", name: "" };
}

function blankStep(): DraftStep {
  return { id: crypto.randomUUID(), text: "" };
}
