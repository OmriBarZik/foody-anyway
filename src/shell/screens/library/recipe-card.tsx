import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { RecipeView } from "../../../domain/domain.types";
import { SpinnerIcon } from "../shell/icons";
import { DishImage } from "./dish-image";
import styles from "./library.module.css";

/** One saved recipe in the grid, with its source and how far reading it got. */
export function RecipeCard({ recipe, go }: { recipe: RecipeView; go: (path: string) => void }) {
  const { t } = useTranslation();
  const [broken, setBroken] = useState(false);
  const path = `/recipes/${recipe.id}`;
  const image = broken ? null : (recipe.dishImageUrl ?? recipe.thumbnailUrl);
  const reading = recipe.extractionStatus === "pending";
  const incomplete = recipe.extractionStatus === "failed" || recipe.extractionStatus === "needs_review";
  const meta = [recipe.savedByName, recipe.cookTime].filter(Boolean).join(" · ");

  return (
    <a
      href={path}
      className={styles.card}
      onClick={(event) => {
        event.preventDefault();
        go(path);
      }}
    >
      <span className={styles.cardImage}>
        {reading ? (
          <span className={styles.reading}>
            <span className={styles.spin}>
              <SpinnerIcon size={26} />
            </span>
            {t("library.reading")}
          </span>
        ) : (
          <DishImage seed={recipe.id} url={image} onError={() => setBroken(true)} />
        )}
        <span className={styles.badge}>{t(`platforms.${recipe.platform}`)}</span>
        {incomplete ? <span className={styles.warning}>{t("library.needsWork")}</span> : null}
      </span>
      <span className={styles.cardTitle}>{recipe.title ?? t(`platforms.${recipe.platform}`)}</span>
      {meta ? <span className={styles.cardMeta}>{meta}</span> : null}
    </a>
  );
}
