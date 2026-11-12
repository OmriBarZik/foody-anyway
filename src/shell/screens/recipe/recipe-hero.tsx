import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { RecipeView } from "../../../domain/domain.types";
import app from "../../app.module.css";
import { DishImage } from "../library/dish-image";
import { BackIcon, PlayIcon } from "../shell/icons";
import styles from "./recipe.module.css";

/** The dish photo with the back button, the video link, the title and who saved it. */
export function RecipeHero({ recipe, go }: { recipe: RecipeView; go: (path: string) => void }) {
  const { t } = useTranslation();
  const [broken, setBroken] = useState(false);
  const image = broken ? null : (recipe.dishImageUrl ?? recipe.thumbnailUrl);
  const platform = t(`platforms.${recipe.platform}`);
  const byline = recipe.platform === "manual" ? t("recipe.byHand") : null;

  return (
    <>
      <div className={styles.hero}>
        <DishImage seed={recipe.id} url={image} iconSize={80} priority onError={() => setBroken(true)} />
        <a
          href="/"
          className={`${app.iconButton} ${styles.back}`}
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
        {recipe.platform !== "manual" ? (
          <a className={styles.watch} href={recipe.sourceUrl} target="_blank" rel="noreferrer">
            <PlayIcon size={16} />
            {t("recipe.watchOn", { platform })}
          </a>
        ) : null}
      </div>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>{recipe.title ?? platform}</h1>
        <p className={styles.byline}>
          {[t("library.savedBy", { name: recipe.savedByName }), byline].filter(Boolean).join(" · ")}
        </p>
        {recipe.sourceNote ? (
          <p className={styles.byline}>{t("recipe.fromSource", { source: recipe.sourceNote })}</p>
        ) : null}
      </div>
    </>
  );
}
