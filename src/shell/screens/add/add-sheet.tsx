import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { detectPlatform } from "../../../library/detect-platform";
import app from "../../app.module.css";
import { useKeyboardInset } from "../../use-keyboard-inset";
import { ArrowIcon, CloseIcon, ForwardIcon, PencilIcon } from "../shell/icons";
import styles from "./add-sheet.module.css";
import { PlatformIcon } from "./platform-icon";

/** A small floating card: paste a link and save it, or go write a recipe by hand. */
export function AddSheet({
  onClose,
  onSave,
  onHand,
}: {
  onClose: () => void;
  onSave: (url: string) => void;
  onHand: () => void;
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const keyboardInset = useKeyboardInset();
  const detected = detectPlatform(url);
  const typed = url.trim().length > 0;

  useEffect(() => {
    field.current?.focus();

    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!detected) {
      return;
    }

    onSave(url.trim());
  }

  return (
    <div className={styles.layer}>
      <button type="button" className={styles.scrim} aria-label={t("add.close")} onClick={onClose} tabIndex={-1} />
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-title"
        data-keyboard={keyboardInset > 0 ? "open" : undefined}
        style={{ "--keyboard-inset": `${keyboardInset}px` } as CSSProperties}
      >
        <div className={styles.head}>
          <h2 id="add-title" className={styles.title}>
            {t("add.title")}
          </h2>
          <button type="button" className={app.iconButtonGhost} aria-label={t("add.close")} onClick={onClose}>
            <CloseIcon size={20} strokeWidth={2.4} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="video-link" className={app.hidden}>
            {t("add.link")}
          </label>
          <div className={styles.linkBox}>
            <span className={styles.platform} data-known={detected ? "true" : "false"}>
              {detected ? <PlatformIcon platform={detected.platform} /> : <PlatformIcon platform="youtube" />}
            </span>
            <input
              ref={field}
              id="video-link"
              className={styles.input}
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder={t("add.placeholder")}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <button type="submit" className={styles.save} aria-label={t("add.save")} disabled={!detected}>
              <ArrowIcon size={22} strokeWidth={2.6} />
            </button>
          </div>
          <p className={styles.hint} data-error={typed && !detected ? "true" : "false"} aria-live="polite">
            {detected
              ? t("add.detected", { platform: t(`platforms.${detected.platform}`) })
              : typed
                ? t("library.badLink")
                : t("add.hint")}
          </p>
        </form>
        <button type="button" className={styles.hand} onClick={onHand}>
          <PencilIcon size={18} strokeWidth={2.2} />
          <span>{t("add.byHand")}</span>
          <span className={styles.handArrow}>
            <ForwardIcon size={18} />
          </span>
        </button>
      </section>
    </div>
  );
}
