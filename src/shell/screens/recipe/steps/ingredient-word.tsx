import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { IngredientLine } from "../recipe.types";
import styles from "./steps.module.css";

const LONG_PRESS_MS = 350;

/**
 * An ingredient named inside a step. A mouse shows the amount on hover; touch shows it on a tap
 * or a long press; the keyboard on Enter. The tooltip is the only extra ink on the page.
 */
export function IngredientWord({
  id,
  text,
  line,
  open,
  onOpen,
  onClose,
}: {
  id: string;
  text: string;
  line: IngredientLine;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const pointer = useRef<string>("mouse");
  const pressTimer = useRef<number | null>(null);
  const pressed = useRef(false);
  const amount = line.amount ?? line.name;
  const out = line.have === false;
  const label = [line.name, line.amount, out ? t("recipe.outLabel") : null].filter(Boolean).join(", ");

  function clearPress(): void {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  return (
    <button
      type="button"
      className={styles.word}
      data-ingredient-word=""
      data-out={out ? "true" : "false"}
      data-open={open ? "true" : "false"}
      aria-label={label}
      aria-describedby={open ? id : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          onOpen();
        }
      }}
      onPointerLeave={(event) => {
        clearPress();

        if (event.pointerType === "mouse") {
          onClose();
        }
      }}
      onPointerDown={(event) => {
        pointer.current = event.pointerType;
        pressed.current = false;

        if (event.pointerType !== "mouse") {
          pressTimer.current = window.setTimeout(() => {
            pressed.current = true;
            onOpen();
          }, LONG_PRESS_MS);
        }
      }}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onContextMenu={(event) => event.preventDefault()}
      onClick={() => {
        // A long press already opened it; the click that follows must not close it again.
        if (pressed.current) {
          pressed.current = false;

          return;
        }

        if (pointer.current === "mouse") {
          onOpen();

          return;
        }

        if (open) {
          onClose();
        } else {
          onOpen();
        }
      }}
    >
      {text}
      {open ? (
        <span role="tooltip" id={id} className={styles.tip}>
          {amount}
          {out ? <span className={styles.tipOut}> · {t("recipe.out")}</span> : null}
        </span>
      ) : null}
    </button>
  );
}
