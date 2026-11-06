import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SuggestionMix, SuggestionView } from "../../../suggest/suggest.types";
import { ApiError } from "../../api";
import styles from "../../app.module.css";
import { fetchSuggestions, shopForRecipe } from "../../client/household-api";

/** Saved recipes the kitchen can cook, and recipes that need a few items. */
export function IdeasScreen({ go }: { go: (path: string) => void }) {
  const { t } = useTranslation();
  const [mix, setMix] = useState<SuggestionMix | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchSuggestions()
      .then((next) => {
        if (active) {
          setMix(next);
        }
      })
      .catch(() => {
        if (active) {
          setErrorCode("save_failed");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function addMissing(recipeId: string): void {
    setErrorCode(null);
    setNotice(null);
    void shopForRecipe(recipeId)
      .then(() => setNotice(t("ideas.added")))
      .catch((error: unknown) => setErrorCode(error instanceof ApiError ? error.code : "save_failed"));
  }

  const ready = mix?.ready ?? [];
  const close = mix?.close ?? [];

  return (
    <section className={styles.stack}>
      <p>{t("ideas.note")}</p>
      {errorCode ? <p className={styles.alert}>{t("ideas.saveFailed")}</p> : null}
      {notice ? <p className={styles.notice}>{notice}</p> : null}
      <SuggestionGroup title={t("ideas.ready")} items={ready} go={go} onAdd={addMissing} />
      <SuggestionGroup title={t("ideas.close")} items={close} go={go} onAdd={addMissing} />
      {mix && ready.length === 0 && close.length === 0 ? <p>{t("ideas.empty")}</p> : null}
    </section>
  );
}

function SuggestionGroup({
  title,
  items,
  go,
  onAdd,
}: {
  title: string;
  items: SuggestionView[];
  go: (path: string) => void;
  onAdd: (recipeId: string) => void;
}) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <ul className={styles.stockList}>
        {items.map((item) => (
          <li key={item.recipeId} className={styles.ideaCard}>
            <button type="button" className={styles.textButton} onClick={() => go(`/recipes/${item.recipeId}`)}>
              {item.title || t("ideas.open")}
            </button>
            {item.missing.length > 0 ? (
              <p>
                {t("ideas.missing")}: {item.missing.map((missing) => missing.name).join(", ")}
              </p>
            ) : null}
            {item.missing.length > 0 ? (
              <button type="button" className={styles.pineButton} onClick={() => onAdd(item.recipeId)}>
                {t("ideas.addMissing")}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
