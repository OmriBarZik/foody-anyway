import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { RecipePlatform, RecipeView, UserView } from "../../../domain/domain.types";
import app from "../../app.module.css";
import { SearchIcon } from "../shell/icons";
import { UserAvatar } from "../shell/user-avatar";
import styles from "./library.module.css";
import { ReadyRow } from "./ready-row";
import { RecipeCard } from "./recipe-card";

/** The household's saved recipes: search, filter by source, and what can be cooked tonight. */
export function LibraryScreen({
  user,
  recipes,
  loadFailed,
  go,
}: {
  user: UserView;
  recipes: RecipeView[];
  loadFailed: boolean;
  go: (path: string) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<RecipePlatform | null>(null);
  const platforms = useMemo(() => [...new Set(recipes.map((recipe) => recipe.platform))], [recipes]);
  const shown = recipes.filter(
    (recipe) => (platform === null || recipe.platform === platform) && matches({ recipe, query }),
  );
  const browsing = query.trim() === "" && platform === null;

  return (
    <div className={app.page}>
      <header className={app.header}>
        <div className={app.headerText}>
          <p className={app.eyebrow}>{user.household.name}</p>
          <h1 className={app.title}>{t("library.title")}</h1>
        </div>
        <UserAvatar user={user} go={go} />
      </header>

      <label className={styles.search}>
        <SearchIcon size={20} />
        <span className={app.hidden}>{t("library.search")}</span>
        <input
          type="search"
          className={styles.searchField}
          placeholder={t("library.search")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {platforms.length > 1 ? (
        <div className={styles.chips}>
          <button
            type="button"
            className={styles.chip}
            aria-pressed={platform === null}
            onClick={() => setPlatform(null)}
          >
            {t("library.all")}
          </button>
          {platforms.map((entry) => (
            <button
              key={entry}
              type="button"
              className={styles.chip}
              aria-pressed={platform === entry}
              onClick={() => setPlatform(platform === entry ? null : entry)}
            >
              {t(`platforms.${entry}`)}
            </button>
          ))}
        </div>
      ) : null}

      {loadFailed ? (
        <p className={app.alert} role="alert">
          {t("library.saveFailed")}
        </p>
      ) : null}

      {browsing && recipes.length > 0 ? <ReadyRow go={go} /> : null}

      <section className={styles.section}>
        {recipes.length > 0 ? <h2 className={app.sectionTitle}>{t("library.allRecipes")}</h2> : null}
        {recipes.length === 0 && !loadFailed ? <p className={app.empty}>{t("library.empty")}</p> : null}
        {recipes.length > 0 && shown.length === 0 ? <p className={app.empty}>{t("library.noMatch")}</p> : null}
        <ul className={styles.grid}>
          {shown.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} go={go} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function matches({ recipe, query }: { recipe: RecipeView; query: string }): boolean {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  const haystack = [
    recipe.title ?? "",
    recipe.savedByName,
    ...recipe.ingredients.flatMap((item) => [item.name, item.nameEn ?? "", item.nameHe ?? ""]),
  ];

  return haystack.some((text) => text.toLowerCase().includes(needle));
}
