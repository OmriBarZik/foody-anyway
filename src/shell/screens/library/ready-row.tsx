import { useTranslation } from "react-i18next";
import type { SuggestionView } from "../../../suggest/suggest.types";
import app from "../../app.module.css";
import { queries } from "../../cache/queries";
import { useCached } from "../../cache/use-cached";
import { DishImage } from "./dish-image";
import styles from "./library.module.css";

const LIMIT = 6;

/** Saved recipes the kitchen can make now, or is one or two items away from. Hidden when there are none. */
export function ReadyRow({ go }: { go: (path: string) => void }) {
  const { t } = useTranslation();
  // The row is extra. When suggestions fail to load the list below still works.
  const { data: mix } = useCached(queries.suggestions);
  const items: SuggestionView[] = mix ? [...mix.ready, ...mix.close].slice(0, LIMIT) : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={app.sectionHead}>
        <h2 className={app.sectionTitle}>{t("library.readyTonight")}</h2>
        <a
          href="/ideas"
          className={app.textLink}
          onClick={(event) => {
            event.preventDefault();
            go("/ideas");
          }}
        >
          {t("library.seeAll")}
        </a>
      </div>
      <div className={styles.rail}>
        {items.map((item) => (
          <a
            key={item.recipeId}
            href={`/recipes/${item.recipeId}`}
            className={styles.railCard}
            onClick={(event) => {
              event.preventDefault();
              go(`/recipes/${item.recipeId}`);
            }}
          >
            <span className={styles.railImage}>
              <DishImage seed={item.recipeId} url={item.thumbnailUrl} iconSize={48} />
              <span className={item.missing.length === 0 ? styles.everything : styles.short}>
                {item.missing.length === 0
                  ? t("library.everythingIn")
                  : t("library.missingCount", { count: item.missing.length })}
              </span>
            </span>
            <span className={styles.railText}>
              <span className={styles.railTitle}>{item.title ?? t("ideas.open")}</span>
              {item.cookTime ? <span className={styles.cardMeta}>{item.cookTime}</span> : null}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
