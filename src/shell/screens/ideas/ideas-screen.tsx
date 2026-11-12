import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SuggestionMix, SuggestionView } from "../../../suggest/suggest.types";
import app from "../../app.module.css";
import { queries } from "../../cache/queries";
import { useCached, writeCache } from "../../cache/use-cached";
import { shopForRecipe } from "../../client/household-api";
import { IdeasSkeleton } from "../skeleton/skeletons";
import { DishImage } from "../library/dish-image";
import { ArrowIcon, CheckIcon, ForwardIcon } from "../shell/icons";
import styles from "./ideas.module.css";

/** Saved recipes the kitchen can cook now, and ones a few items short, with a way to list what is missing. */
export function IdeasScreen({ go }: { go: (path: string) => void }) {
  const { t } = useTranslation();
  const cached = useCached(queries.suggestions);
  const mix: SuggestionMix | null = cached.data ?? null;
  const [added, setAdded] = useState<string[]>([]);
  const [saveFailed, setFailed] = useState(false);
  const failed = saveFailed || cached.failed;

  function addMissing(recipeId: string): void {
    setFailed(false);
    void shopForRecipe(recipeId)
      .then((list) => {
        writeCache({ key: queries.shop.key, data: list });
        setAdded((current) => [...current, recipeId]);
      })
      .catch(() => setFailed(true));
  }

  const ready = mix?.ready ?? [];
  const close = mix?.close ?? [];
  const [hero, ...rest] = ready;
  const open = (recipeId: string) => go(`/recipes/${recipeId}`);

  return (
    <div className={app.page}>
      <header className={app.headerText}>
        <p className={app.eyebrow}>{t("ideas.lead")}</p>
        <h1 className={app.title}>{t("ideas.title")}</h1>
      </header>
      {failed ? <p className={app.alert}>{t("ideas.saveFailed")}</p> : null}
      {!mix && !failed ? <IdeasSkeleton /> : null}

      {hero ? (
        <section className={styles.section}>
          <h2 className={styles.heading}>
            <span className={styles.dotReady} aria-hidden="true" />
            {t("ideas.ready")}
          </h2>
          <a
            href={`/recipes/${hero.recipeId}`}
            className={styles.hero}
            onClick={(event) => {
              event.preventDefault();
              open(hero.recipeId);
            }}
          >
            <span className={styles.heroImage}>
              <DishImage seed={hero.recipeId} url={hero.thumbnailUrl} iconSize={64} priority />
            </span>
            <span className={styles.heroBody}>
              <span className={app.rowText}>
                <span className={styles.heroTitle}>{hero.title ?? t("ideas.open")}</span>
                {hero.cookTime ? <span className={styles.heroMeta}>{hero.cookTime}</span> : null}
              </span>
              <span className={styles.go}>
                <ArrowIcon size={22} strokeWidth={2.4} />
              </span>
            </span>
          </a>
          {rest.map((item) => (
            <IdeaRow key={item.recipeId} item={item} onOpen={open} />
          ))}
        </section>
      ) : null}

      {close.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.heading}>
            <span className={styles.dotShort} aria-hidden="true" />
            {t("ideas.close")}
          </h2>
          {close.map((item) => (
            <article key={item.recipeId} className={styles.shortCard}>
              <IdeaRow item={item} onOpen={open} flat />
              <div className={styles.missing}>
                <span className={styles.missingLabel}>{t("ideas.missing")}</span>
                {item.missing.map((entry) => (
                  <span key={entry.name} className={styles.missingChip}>
                    {entry.name}
                  </span>
                ))}
              </div>
              {added.includes(item.recipeId) ? (
                <p className={styles.added}>
                  <CheckIcon size={16} strokeWidth={3} />
                  {t("ideas.added")}
                </p>
              ) : (
                <button type="button" className={app.outline} onClick={() => addMissing(item.recipeId)}>
                  {t("ideas.addMissing")}
                </button>
              )}
            </article>
          ))}
        </section>
      ) : null}

      {mix && ready.length === 0 && close.length === 0 ? <p className={app.empty}>{t("ideas.empty")}</p> : null}
      <p className={styles.note}>{t("ideas.note")}</p>
    </div>
  );
}

function IdeaRow({
  item,
  onOpen,
  flat = false,
}: {
  item: SuggestionView;
  onOpen: (recipeId: string) => void;
  flat?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <a
      href={`/recipes/${item.recipeId}`}
      className={flat ? styles.rowFlat : styles.row}
      onClick={(event) => {
        event.preventDefault();
        onOpen(item.recipeId);
      }}
    >
      <span className={styles.thumb}>
        <DishImage seed={item.recipeId} url={item.thumbnailUrl} iconSize={28} />
      </span>
      <span className={app.rowText}>
        <span className={app.rowTitle}>{item.title ?? t("ideas.open")}</span>
        {item.cookTime ? <span className={app.rowSub}>{item.cookTime}</span> : null}
      </span>
      {flat ? null : (
        <span className={styles.chevron}>
          <ForwardIcon size={20} />
        </span>
      )}
    </a>
  );
}
