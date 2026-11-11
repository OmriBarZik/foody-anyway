import { useSyncExternalStore } from "react";
import { LibrarySkeleton, NavSkeleton, RecipeSkeleton } from "./skeletons";

/**
 * What the page shows before the account loads. It needs no translations, so the server
 * can send it in the first HTML and the screen is never blank.
 */
export function BootSkeleton() {
  // The server does not know the path the browser will settle on; hydrate with "/" and then switch.
  const path = useSyncExternalStore(
    subscribeNever,
    () => window.location.pathname,
    () => "/",
  );

  if (/^\/recipes\/(?!new$)[^/]+$/.test(path)) {
    return (
      <main>
        <RecipeSkeleton />
      </main>
    );
  }

  return (
    <main>
      <LibrarySkeleton />
      <NavSkeleton />
    </main>
  );
}

function subscribeNever(): () => void {
  return () => undefined;
}
