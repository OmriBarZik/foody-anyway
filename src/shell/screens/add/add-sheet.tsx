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
  const sheet = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const keyboardInset = useKeyboardInset();
  const detected = detectPlatform(url);
  const typed = url.trim().length > 0;

  useEffect(() => {
    const dialog = sheet.current;

    if (!dialog) {
      return;
    }

    // A modal dialog makes the page behind it inert, keeps focus inside, and closes on Esc or the back gesture.
    if (!dialog.open) {
      dialog.showModal();
    }

    field.current?.focus();

    return lightDismissFallback(dialog);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!detected) {
      return;
    }

    onSave(url.trim());
  }

  return (
    <dialog
      ref={sheet}
      className={styles.sheet}
      {...({ closedby: "any" } as object)}
      aria-labelledby="add-title"
      onClose={onClose}
      data-keyboard={keyboardInset > 0 ? "open" : undefined}
      style={{ "--keyboard-inset": `${keyboardInset}px` } as CSSProperties}
    >
      <div className={styles.head}>
        <h2 id="add-title" className={styles.title}>
          {t("add.title")}
        </h2>
        <button
          type="button"
          className={app.iconButtonGhost}
          aria-label={t("add.close")}
          onClick={() => sheet.current?.close()}
        >
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
    </dialog>
  );
}

/**
 * Safari does not support closedby="any" yet, so close the sheet there when a tap starts and ends outside it.
 * Returns the cleanup that removes the listeners.
 */
function lightDismissFallback(dialog: HTMLDialogElement): () => void {
  if ("closedBy" in HTMLDialogElement.prototype) {
    return () => {};
  }

  // Test the pointer position, not the target: the dialog is also the target for its own padding.
  function outside(event: PointerEvent): boolean {
    const box = dialog.getBoundingClientRect();

    return (
      event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom
    );
  }

  let pressedOutside = false;

  function onDown(event: PointerEvent): void {
    pressedOutside = outside(event);
  }

  function onUp(event: PointerEvent): void {
    if (pressedOutside && outside(event)) {
      dialog.close();
    }
  }

  dialog.addEventListener("pointerdown", onDown);
  dialog.addEventListener("pointerup", onUp);

  return () => {
    dialog.removeEventListener("pointerdown", onDown);
    dialog.removeEventListener("pointerup", onUp);
  };
}
