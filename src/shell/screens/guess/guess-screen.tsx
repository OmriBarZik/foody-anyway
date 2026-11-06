import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import type { GuessDeck, GuessDecision } from "../../../guess/guess.types";
import { ApiError } from "../../api";
import styles from "../../app.module.css";
import { answerGuess, fetchGuess } from "../../client/household-api";
import { useReducedMotion } from "../../motion/use-reduced-motion";
import { GuessCard } from "./guess-card";

const SLIDE_MS = 340;
const SWIPE_PX = 72;

/** Swipe proposed staples into the kitchen or past them. */
export function GuessScreen() {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [deck, setDeck] = useState<GuessDeck | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flight, setFlight] = useState<GuessDecision | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const originX = useRef<number | null>(null);
  const busy = useRef(false);
  const fromKeys = useRef(false);
  const deckRef = useRef<HTMLElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    void fetchGuess()
      .then((next) => {
        if (active) {
          setDeck(next);
        }
      })
      .catch(() => {
        if (active) {
          setErrorCode("save_failed");
        }
      });

    return () => {
      active = false;

      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  function choose({ decision, keyed }: { decision: GuessDecision; keyed: boolean }): void {
    const card = deck?.card;

    if (!card || busy.current) {
      return;
    }

    busy.current = true;
    fromKeys.current = keyed;
    setErrorCode(null);
    setDragging(false);
    setFlight(reducedMotion ? null : decision);
    setAnnouncement(t(decision === "have" ? "guess.announcedHave" : "guess.announcedSkip", { name: card.name }));
    const started = Date.now();
    void answerGuess({ stapleEn: card.stapleEn, decision })
      .then((next) => {
        const elapsed = Date.now() - started;
        const wait = reducedMotion ? 0 : Math.max(0, SLIDE_MS - elapsed);
        timer.current = window.setTimeout(() => {
          setDeck(next);
          setFlight(null);
          setDragX(0);
          busy.current = false;

          if (fromKeys.current) {
            deckRef.current?.focus();
          }
        }, wait);
      })
      .catch((error: unknown) => {
        setFlight(null);
        setDragX(0);
        busy.current = false;
        setErrorCode(error instanceof ApiError ? error.code : "save_failed");
      });
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      choose({ decision: "have", keyed: true });
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      choose({ decision: "skip", keyed: true });
    }
  }

  function onPointerDown(event: PointerEvent<HTMLElement>): void {
    if (busy.current || event.button !== 0 || isControl(event.target)) {
      return;
    }

    originX.current = event.clientX;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>): void {
    if (originX.current === null || reducedMotion) {
      return;
    }

    setDragX(event.clientX - originX.current);
  }

  function onPointerUp(event: PointerEvent<HTMLElement>): void {
    if (originX.current === null) {
      return;
    }

    const delta = event.clientX - originX.current;
    originX.current = null;
    setDragging(false);

    if (delta > SWIPE_PX) {
      choose({ decision: "have", keyed: false });

      return;
    }

    if (delta < -SWIPE_PX) {
      choose({ decision: "skip", keyed: false });

      return;
    }

    setDragX(0);
  }

  function onPointerCancel(): void {
    originX.current = null;
    setDragging(false);
    setDragX(0);
  }

  const card = deck?.card ?? null;
  const shownFlight = reducedMotion ? null : flight;
  const chooseRef = useRef(choose);
  chooseRef.current = choose;

  useEffect(() => {
    function onWindowKey(event: globalThis.KeyboardEvent): void {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isTyping(event.target)) {
        return;
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      event.preventDefault();
      chooseRef.current({
        decision: event.key === "ArrowRight" ? "have" : "skip",
        keyed: true,
      });
    }

    window.addEventListener("keydown", onWindowKey);

    return () => {
      window.removeEventListener("keydown", onWindowKey);
    };
  }, []);

  return (
    <section
      ref={deckRef}
      className={styles.guessStage}
      tabIndex={0}
      aria-label={card?.name ?? t("nav.guess")}
      aria-describedby="guess-lead"
      aria-keyshortcuts="ArrowLeft ArrowRight"
      onKeyDown={onKeyDown}
    >
      <p className={styles.guessLead} id="guess-lead">
        {t("guess.lead")}
      </p>
      <p className={styles.live} aria-live="polite">
        {announcement}
      </p>
      {errorCode ? (
        <p className={styles.alert} role="alert">
          {t("guess.saveFailed")}
        </p>
      ) : null}
      {card ? (
        <GuessCard
          name={card.name}
          location={t(`stock.locations.${card.location}`)}
          dragX={shownFlight ? 0 : dragX}
          dragging={dragging && !reducedMotion}
          flight={shownFlight}
          disabled={flight !== null}
          skipLabel={t("guess.skip")}
          haveLabel={t("guess.have")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onSkip={() => choose({ decision: "skip", keyed: false })}
          onHave={() => choose({ decision: "have", keyed: false })}
        />
      ) : (
        <p>{deck ? t("guess.empty") : null}</p>
      )}
    </section>
  );
}

function isControl(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("button, a, input") !== null;
}

function isTyping(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("input, textarea, select, [contenteditable='true']") !== null;
}
