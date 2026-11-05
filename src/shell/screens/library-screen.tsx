import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { RecipeView } from "../../domain/domain.types";
import styles from "../app.module.css";

/** Paste box and the household's saved videos. */
export function LibraryScreen({
  recipes,
  saving,
  errorCode,
  selectedId,
  onOpen,
  onSave,
}: {
  recipes: RecipeView[];
  saving: boolean;
  errorCode: string | null;
  selectedId: string | null;
  onOpen: (recipeId: string) => void;
  onSave: (url: string) => void;
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = url.trim();

    if (!trimmed || saving) {
      return;
    }

    onSave(trimmed);
  }

  const error =
    errorCode === "bad_link"
      ? t("library.badLink")
      : errorCode === "save_failed" || errorCode === "load_failed"
        ? t("library.saveFailed")
        : null;

  return (
    <div>
      <form className={styles.paste} onSubmit={submit}>
        <label className={styles.pasteLabel} htmlFor="video-link">
          {t("library.pasteLabel")}
        </label>
        <div className={styles.pasteRow}>
          <input
            id="video-link"
            className={styles.pasteField}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <button className={styles.chiliButton} type="submit" disabled={saving}>
            {saving ? t("library.saving") : t("library.save")}
          </button>
        </div>
        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}
      </form>
      {recipes.length === 0 ? <p>{t("library.empty")}</p> : null}
      <ul className={styles.recipeList}>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <button
              type="button"
              className={styles.recipeButton}
              aria-current={recipe.id === selectedId ? "true" : undefined}
              onClick={() => onOpen(recipe.id)}
            >
              {recipe.dishImageUrl || recipe.thumbnailUrl ? (
                <img className={styles.thumb} src={recipe.dishImageUrl ?? recipe.thumbnailUrl ?? ""} alt="" />
              ) : (
                <span className={styles.thumb} />
              )}
              <span className={styles.cardTitle}>{recipe.title ?? t(`platforms.${recipe.platform}`)}</span>
              <span className={styles.byline}>{t("library.savedBy", { name: recipe.savedByName })}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
