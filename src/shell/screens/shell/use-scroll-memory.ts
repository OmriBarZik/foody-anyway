import { useEffect, useLayoutEffect, useRef } from "react";
import type { AppRoute } from "../../shell.types";
import { lastNavigation } from "../../use-route";

const positions = new Map<string, number>();

/** New pages open at the top; going back returns to where the list was left. */
export function useScrollMemory({ route, selectedId }: { route: AppRoute; selectedId: string | null }): void {
  const pathRef = useRef(currentPath());

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        positions.set(pathRef.current, window.scrollY);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const path = currentPath();

    if (path === pathRef.current) {
      return;
    }

    pathRef.current = path;
    window.scrollTo(0, lastNavigation() === "pop" ? (positions.get(path) ?? 0) : 0);
  }, [route.name, selectedId]);
}

function currentPath(): string {
  return window.location.pathname + window.location.search;
}
