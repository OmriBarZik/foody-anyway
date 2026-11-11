import { useEffect, useState } from "react";

/**
 * How many pixels the on-screen keyboard covers at the bottom of the page, or 0 when it is closed.
 * Phones draw the keyboard over the page without moving fixed elements, so a bar pinned to the
 * bottom uses this to sit on top of the keyboard instead of hiding behind it.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) {
      return;
    }

    const visible = viewport;

    function measure(): void {
      const covered = window.innerHeight - visible.height - visible.offsetTop;
      setInset(Math.max(0, Math.round(covered)));
    }

    measure();
    visible.addEventListener("resize", measure);
    visible.addEventListener("scroll", measure);

    return () => {
      visible.removeEventListener("resize", measure);
      visible.removeEventListener("scroll", measure);
    };
  }, []);

  return inset;
}
