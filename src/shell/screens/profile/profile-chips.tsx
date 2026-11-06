import { useState } from "react";
import type { FormEvent } from "react";
import styles from "../../app.module.css";

/** A short list of words with an add field. */
export function WordList({
  label,
  words,
  addLabel,
  onChange,
}: {
  label: string;
  words: string[];
  addLabel: string;
  onChange: (words: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const word = draft.trim();

    if (!word) {
      return;
    }

    onChange([...words, word]);
    setDraft("");
  }

  return (
    <fieldset className={styles.wordList}>
      <legend>{label}</legend>
      <ul className={styles.chips}>
        {words.map((word) => (
          <li key={word}>
            <button
              type="button"
              className={styles.chip}
              onClick={() => onChange(words.filter((item) => item !== word))}
            >
              {word}
            </button>
          </li>
        ))}
      </ul>
      <form className={styles.pasteRow} onSubmit={submit}>
        <input
          className={styles.pasteField}
          value={draft}
          aria-label={label}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className={styles.pineButton} type="submit">
          {addLabel}
        </button>
      </form>
    </fieldset>
  );
}
