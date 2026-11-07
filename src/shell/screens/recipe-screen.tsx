import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { MeasurementSystem, RecipeView } from "../../domain/domain.types";
import { displayIngredient } from "../../library/convert-units";
import styles from "../app.module.css";

/** A saved video laid out so it can be cooked from. */
export function RecipeScreen({
  recipe,
  measurement,
  missing,
  retrying,
  retryError,
  onBack,
  onRetry,
}: {
  recipe: RecipeView | null;
  measurement: MeasurementSystem;
  missing: boolean;
  retrying: boolean;
  retryError: string | null;
  onBack: () => void;
  onRetry: (recipeId: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "he" ? "he" : "en";
  const [imageFailed, setImageFailed] = useState(false);

  if (missing || !recipe) {
    return (
      <article>
        <button type="button" className={styles.back} onClick={onBack}>
          {t("recipe.back")}
        </button>
        <p>{missing ? t("recipe.missing") : t("library.choose")}</p>
      </article>
    );
  }

  const imageUrl = recipe.dishImageUrl ?? recipe.thumbnailUrl;
  const detail = detailLine({
    recipe,
    timeAndServings: t("recipe.timeAndServings", { time: recipe.cookTime, servings: recipe.servings }),
    time: t("recipe.time", { time: recipe.cookTime }),
    servings: t("recipe.servings", { servings: recipe.servings }),
  });

  return (
    <article>
      <button type="button" className={styles.back} onClick={onBack}>
        {t("recipe.back")}
      </button>
      {imageUrl && !imageFailed ? (
        <img className={styles.heroImage} src={imageUrl} alt="" onError={() => setImageFailed(true)} />
      ) : null}
      <p className={styles.meta}>{t(`platforms.${recipe.platform}`)}</p>
      <h2 className={styles.recipeTitle}>{recipe.title ?? t(`platforms.${recipe.platform}`)}</h2>
      <p className={styles.byline}>{t("library.savedBy", { name: recipe.savedByName })}</p>
      {detail ? <p className={styles.detailLine}>{detail}</p> : null}
      {recipe.extractionStatus !== "ready" ? (
        <>
          <p className={styles.notice}>{t(statusKey(recipe.extractionStatus))}</p>
          <p>
            <button type="button" className={styles.pineButton} disabled={retrying} onClick={() => onRetry(recipe.id)}>
              {retrying ? t("recipe.retrying") : t("recipe.retry")}
            </button>
          </p>
          {retryError ? (
            <p className={styles.alert} role="alert">
              {t(retryErrorKey(retryError))}
            </p>
          ) : null}
        </>
      ) : null}
      <p>
        <a className={styles.videoLink} href={recipe.sourceUrl} target="_blank" rel="noreferrer">
          {t("recipe.openVideo")}
        </a>
      </p>
      {recipe.ingredients.length > 0 ? (
        <>
          <h3 className={styles.sectionTitle}>{t("recipe.ingredients")}</h3>
          <ul className={styles.ingredients}>
            {recipe.ingredients.map((ingredient, index) => {
              const display = displayIngredient({ ingredient, preference: measurement, locale });

              return (
                <li key={`${ingredient.name}-${index}`} className={display.amountLabel ? undefined : styles.nameOnly}>
                  {display.amountLabel ? <span className={styles.amount}>{display.amountLabel}</span> : null}
                  <span>{display.name}</span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      {recipe.steps.length > 0 ? (
        <>
          <h3 className={styles.sectionTitle}>{t("recipe.steps")}</h3>
          <ol className={styles.steps}>
            {recipe.steps.map((step) => (
              <li key={step.order}>{step.text}</li>
            ))}
          </ol>
        </>
      ) : null}
    </article>
  );
}

function statusKey(status: RecipeView["extractionStatus"]): string {
  if (status === "needs_review") {
    return "recipe.needsReview";
  }

  return `recipe.${status}`;
}

function retryErrorKey(code: string): string {
  if (code === "retry_in_progress") {
    return "recipe.retryInProgress";
  }

  if (code === "retry_rate_limited") {
    return "recipe.retryRateLimited";
  }

  if (code === "retry_limit_daily") {
    return "recipe.retryLimitDaily";
  }

  return "recipe.retryFailed";
}

function detailLine({
  recipe,
  timeAndServings,
  time,
  servings,
}: {
  recipe: RecipeView;
  timeAndServings: string;
  time: string;
  servings: string;
}): string | null {
  if (recipe.cookTime && recipe.servings) {
    return timeAndServings;
  }

  if (recipe.cookTime) {
    return time;
  }

  if (recipe.servings) {
    return servings;
  }

  return null;
}
