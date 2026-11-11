import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Locale, MeasurementSystem, RecipeView } from "../../../domain/domain.types";
import { displayIngredient } from "../../../library/convert-units";
import { stockCovers } from "../../../shared/stock-covers";
import { queries } from "../../cache/queries";
import { useCached, writeCache } from "../../cache/use-cached";
import { RecipeSkeleton } from "../skeleton/skeletons";
import app from "../../app.module.css";
import { shopForRecipe } from "../../client/household-api";
import { BackIcon, PlusIcon } from "../shell/icons";
import { IngredientList } from "./ingredient-list";
import { RecipeHero } from "./recipe-hero";
import type { IngredientLine } from "./recipe.types";
import styles from "./recipe.module.css";
import { RecipeSteps } from "./steps/recipe-steps";
import { RecipeStatus } from "./recipe-status";

/** A saved recipe laid out to cook from: what it needs, what the kitchen has, and the steps. */
export function RecipeScreen({
  recipe,
  measurement,
  missing,
  retrying,
  retryError,
  go,
  onRetry,
}: {
  recipe: RecipeView | null;
  measurement: MeasurementSystem;
  missing: boolean;
  retrying: boolean;
  retryError: string | null;
  go: (path: string) => void;
  onRetry: (recipeId: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language === "he" ? "he" : "en";
  const [tab, setTab] = useState<"ingredients" | "steps">("ingredients");
  // Without stock the recipe still reads fine; it just cannot mark what is out.
  const stock = useCached(queries.stock).data ?? null;
  const [shopNote, setShopNote] = useState<"added" | "failed" | null>(null);

  if (missing) {
    return (
      <div className={app.page}>
        <BackLink go={go} />
        <p className={app.empty}>{t("recipe.missing")}</p>
      </div>
    );
  }

  if (!recipe) {
    return <RecipeSkeleton />;
  }

  const current = recipe;
  const lines: IngredientLine[] = current.ingredients.map((ingredient, index) => {
    const display = displayIngredient({ ingredient, preference: measurement, locale });

    return {
      index,
      name: display.name,
      amount: display.amountLabel,
      have: stock ? stockCovers({ stock, ingredient }) : null,
    };
  });
  const outCount = lines.filter((line) => line.have === false).length;

  function addMissing(): void {
    setShopNote(null);
    void shopForRecipe(current.id)
      .then((list) => {
        writeCache({ key: queries.shop.key, data: list });
        setShopNote("added");
      })
      .catch(() => setShopNote("failed"));
  }

  return (
    <div className={styles.screen}>
      <RecipeHero recipe={current} go={go} />
      <div className={styles.body}>
        <RecipeStatus recipe={current} retrying={retrying} retryError={retryError} onRetry={onRetry} />
        <MetaChips recipe={current} lines={lines} />
        {lines.length > 0 && current.steps.length > 0 ? (
          <div className={styles.segmented} role="tablist" aria-label={t("recipe.sections")}>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "ingredients"}
              onClick={() => setTab("ingredients")}
            >
              {t("recipe.ingredients")}
            </button>
            <button type="button" role="tab" aria-selected={tab === "steps"} onClick={() => setTab("steps")}>
              {t("recipe.steps")}
            </button>
          </div>
        ) : null}
        {lines.length > 0 && (tab === "ingredients" || current.steps.length === 0) ? (
          <IngredientList lines={lines} />
        ) : null}
        {current.steps.length > 0 && (tab === "steps" || lines.length === 0) ? (
          <RecipeSteps recipe={current} lines={lines} />
        ) : null}
        {shopNote === "added" ? <p className={app.notice}>{t("recipe.addedMissing")}</p> : null}
        {shopNote === "failed" ? <p className={app.alert}>{t("recipe.addFailed")}</p> : null}
      </div>
      {outCount > 0 && shopNote !== "added" ? (
        <div className={styles.actionBar}>
          <button type="button" className={`${app.dark} ${styles.action}`} onClick={addMissing}>
            <span className={styles.actionIcon}>
              <PlusIcon size={20} strokeWidth={2.4} />
            </span>
            {t("recipe.addMissing")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MetaChips({ recipe, lines }: { recipe: RecipeView; lines: IngredientLine[] }) {
  const { t } = useTranslation();
  const known = lines.filter((line) => line.have !== null);
  const have = known.filter((line) => line.have).length;

  return (
    <div className={styles.chips}>
      {recipe.cookTime ? <span className={styles.chip}>{recipe.cookTime}</span> : null}
      {recipe.servings ? <span className={styles.chip}>{recipe.servings}</span> : null}
      {known.length > 0 ? (
        <span className={have === known.length ? styles.chipLime : styles.chip}>
          {t("recipe.inKitchen", { have, total: known.length })}
        </span>
      ) : null}
    </div>
  );
}

function BackLink({ go }: { go: (path: string) => void }) {
  const { t } = useTranslation();

  return (
    <a
      href="/"
      className={app.iconButton}
      aria-label={t("recipe.backToRecipes")}
      onClick={(event) => {
        event.preventDefault();
        go("/");
      }}
    >
      <span className={styles.flip}>
        <BackIcon size={22} strokeWidth={2.2} />
      </span>
    </a>
  );
}
