import type { PointerEvent } from "react";
import type { GuessDecision } from "../../../guess/guess.types";
import styles from "../../app.module.css";

/** The staple card. It follows a drag, then slides off when a side is chosen. */
export function GuessCard({
  name,
  location,
  dragX,
  dragging,
  flight,
  disabled,
  skipLabel,
  haveLabel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onSkip,
  onHave,
}: {
  name: string;
  location: string;
  dragX: number;
  dragging: boolean;
  flight: GuessDecision | null;
  disabled: boolean;
  skipLabel: string;
  haveLabel: string;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
  onSkip: () => void;
  onHave: () => void;
}) {
  const lean = dragX > 36 ? "have" : dragX < -36 ? "skip" : "none";

  return (
    <div className={styles.deck}>
      <div className={styles.deckBack} aria-hidden="true" />
      <article
        className={styles.guessCard}
        data-dragging={dragging ? "true" : "false"}
        data-flight={flight ?? "none"}
        data-lean={lean}
        style={flight ? undefined : { transform: `translateX(${dragX}px) rotate(${dragX / 30}deg)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <p className={styles.guessName}>{name}</p>
        <p className={styles.guessPlace}>{location}</p>
        <div className={styles.guessActions}>
          <button type="button" className={styles.chiliButton} disabled={disabled} onClick={onSkip}>
            {skipLabel}
          </button>
          <button type="button" className={styles.pineButton} disabled={disabled} onClick={onHave}>
            {haveLabel}
          </button>
        </div>
      </article>
    </div>
  );
}
