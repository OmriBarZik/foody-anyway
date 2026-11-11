import { useTranslation } from "react-i18next";
import app from "../../app.module.css";
import { CloseIcon, PlusIcon } from "../shell/icons";
import type { DraftIngredient, DraftStep } from "./new-recipe.types";
import styles from "./new-recipe.module.css";

/** Amount and name rows, with a remove button on each and one to add another. */
export function IngredientRows({
  lines,
  onChange,
  onAdd,
}: {
  lines: DraftIngredient[];
  onChange: (lines: DraftIngredient[]) => void;
  onAdd: () => void;
}) {
  const { t } = useTranslation();

  function update(id: string, change: Partial<DraftIngredient>): void {
    onChange(lines.map((line) => (line.id === id ? { ...line, ...change } : line)));
  }

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{t("newRecipe.ingredients")}</legend>
      {lines.map((line, index) => (
        <div key={line.id} className={styles.ingredientRow}>
          <input
            className={`${app.field} ${styles.amount}`}
            aria-label={t("newRecipe.amountN", { n: index + 1 })}
            placeholder={t("newRecipe.amountPlaceholder")}
            value={line.amount}
            onChange={(event) => update(line.id, { amount: event.target.value })}
          />
          <input
            className={app.field}
            aria-label={t("newRecipe.ingredientN", { n: index + 1 })}
            placeholder={t("newRecipe.ingredientPlaceholder")}
            value={line.name}
            onChange={(event) => update(line.id, { name: event.target.value })}
          />
          <button
            type="button"
            className={app.iconButtonGhost}
            aria-label={t("newRecipe.removeIngredient", { n: index + 1 })}
            onClick={() => onChange(lines.filter((entry) => entry.id !== line.id))}
          >
            <CloseIcon size={18} strokeWidth={2.2} />
          </button>
        </div>
      ))}
      <button type="button" className={`${app.soft} ${styles.addRow}`} onClick={onAdd}>
        <PlusIcon size={18} strokeWidth={2.6} />
        {t("newRecipe.addIngredient")}
      </button>
    </fieldset>
  );
}

/** Numbered step boxes, with one to add another. */
export function StepRows({
  steps,
  onChange,
  onAdd,
}: {
  steps: DraftStep[];
  onChange: (steps: DraftStep[]) => void;
  onAdd: () => void;
}) {
  const { t } = useTranslation();

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{t("newRecipe.steps")}</legend>
      {steps.map((step, index) => (
        <div key={step.id} className={styles.stepRow}>
          <span className={styles.stepNumber} aria-hidden="true">
            {index + 1}
          </span>
          <textarea
            className={styles.stepField}
            rows={2}
            aria-label={t("newRecipe.stepN", { n: index + 1 })}
            placeholder={t("newRecipe.stepPlaceholder")}
            value={step.text}
            onChange={(event) =>
              onChange(steps.map((entry) => (entry.id === step.id ? { ...entry, text: event.target.value } : entry)))
            }
          />
          {steps.length > 1 ? (
            <button
              type="button"
              className={app.iconButtonGhost}
              aria-label={t("newRecipe.removeStep", { n: index + 1 })}
              onClick={() => onChange(steps.filter((entry) => entry.id !== step.id))}
            >
              <CloseIcon size={18} strokeWidth={2.2} />
            </button>
          ) : null}
        </div>
      ))}
      <button type="button" className={`${app.soft} ${styles.addRow}`} onClick={onAdd}>
        <PlusIcon size={18} strokeWidth={2.6} />
        {t("newRecipe.addStep")}
      </button>
    </fieldset>
  );
}
