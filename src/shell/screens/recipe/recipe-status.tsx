import { useTranslation } from "react-i18next";
import type { RecipeView } from "../../../domain/domain.types";
import app from "../../app.module.css";
import styles from "./recipe.module.css";

/** Why a saved video is not ready yet, with a way to read it again. Nothing when it is ready. */
export function RecipeStatus({
  recipe,
  retrying,
  retryError,
  onRetry,
}: {
  recipe: RecipeView;
  retrying: boolean;
  retryError: string | null;
  onRetry: (recipeId: string) => void;
}) {
  const { t } = useTranslation();

  if (recipe.extractionStatus === "ready") {
    return null;
  }

  return (
    <div className={styles.status}>
      <p className={styles.statusText}>{t(statusKey(recipe.extractionStatus))}</p>
      <button
        type="button"
        className={app.primary}
        disabled={retrying || recipe.extractionStatus === "pending"}
        onClick={() => onRetry(recipe.id)}
      >
        {retrying ? t("recipe.retrying") : t("recipe.retry")}
      </button>
      {retryError ? (
        <p className={app.alert} role="alert">
          {t(retryErrorKey(retryError))}
        </p>
      ) : null}
    </div>
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
