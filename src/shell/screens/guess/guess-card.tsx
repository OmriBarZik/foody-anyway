import type { PointerEvent } from "react";
import type { GuessDecision } from "../../../guess/guess.types";
import { CheckIcon, CloseIcon } from "../shell/icons";
import styles from "./guess.module.css";

/** The staple card on its deck, and the two answer buttons under it. The card follows a drag. */
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
    <>
      <div className={styles.deck}>
        <div className={styles.back} aria-hidden="true" />
        <div className={styles.middle} aria-hidden="true" />
        <article
          className={styles.card}
          data-dragging={dragging ? "true" : "false"}
          data-flight={flight ?? "none"}
          data-lean={lean}
          style={flight ? undefined : { transform: `translateX(${dragX}px) rotate(${dragX / 30}deg)` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <span className={styles.place}>{location}</span>
          <p className={styles.name}>{name}</p>
          <span className={styles.hint} aria-hidden="true">
            <span>← {skipLabel}</span>
            <span>{haveLabel} →</span>
          </span>
        </article>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.skip} disabled={disabled} onClick={onSkip}>
          <CloseIcon size={20} strokeWidth={2.6} />
          {skipLabel}
        </button>
        <button type="button" className={styles.have} disabled={disabled} onClick={onHave}>
          <CheckIcon size={20} strokeWidth={2.6} />
          {haveLabel}
        </button>
      </div>
    </>
  );
}
