import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { CloseIcon, PlusIcon } from "../shell/icons";
import styles from "./me.module.css";

/** A short list of words as removable chips, with an inline field to add one. */
export function WordChips({
  label,
  words,
  tone,
  onChange,
}: {
  label: string;
  words: string[];
  tone: "warn" | "plain" | "good";
  onChange: (words: string[]) => void;
}) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commit(): void {
    const word = draft.trim();

    if (word && !words.includes(word)) {
      onChange([...words, word]);
    }

    setDraft("");
    setAdding(false);
  }

  function onKey(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();

      // Enter also confirms a word typed with an IME (Japanese, Chinese, Korean); that Enter must not add a half-typed word.
      // Safari reports isComposing as false on that keydown, but every browser gives it keyCode 229.
      if (event.nativeEvent.isComposing || event.keyCode === 229) {
        return;
      }

      commit();
    }

    if (event.key === "Escape") {
      setDraft("");
      setAdding(false);
    }
  }

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.choices}>
        {words.map((word) => (
          <span key={word} className={styles.word} data-tone={tone}>
            {word}
            <button
              type="button"
              aria-label={`${t("stock.remove")} ${word}`}
              onClick={() => onChange(words.filter((item) => item !== word))}
            >
              <CloseIcon size={14} strokeWidth={3} />
            </button>
          </span>
        ))}
        {adding ? (
          <input
            className={styles.wordField}
            value={draft}
            aria-label={label}
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKey}
            onBlur={commit}
          />
        ) : (
          <button type="button" className={styles.addWord} onClick={() => setAdding(true)}>
            <PlusIcon size={14} strokeWidth={2.6} />
            {t("profile.add")}
          </button>
        )}
      </div>
    </fieldset>
  );
}
