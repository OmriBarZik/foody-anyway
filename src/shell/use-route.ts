import { useEffect, useState } from "react";
import type { AppRoute, AuthError, RouteState, SectionName } from "./shell.types";

/** Keep the screen in sync with the path, without a router library. */
export function useRoute(): RouteState {
  const [path, setPath] = useState(() => window.location.pathname + window.location.search);

  useEffect(() => {
    const onPop = () => {
      setPath(window.location.pathname + window.location.search);
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  function go(next: string): void {
    window.history.pushState({}, "", next);
    setPath(next);
  }

  return { route: parseRoute(path), go };
}

const SECTION_PATHS: Record<string, SectionName> = {
  "/stock": "stock",
  "/guess": "guess",
  "/shop": "shop",
  "/ideas": "ideas",
  "/me": "me",
  // Older links to the profile and settings pages open the merged page.
  "/profile": "me",
  "/settings": "me",
  "/costs": "costs",
};

function parseRoute(path: string): AppRoute {
  const url = new URL(path, window.location.origin);
  const authError = readAuthError(url.searchParams.get("auth"));
  const invite = /^\/invite\/([^/]+)$/.exec(url.pathname);
  const recipe = /^\/recipes\/([^/]+)$/.exec(url.pathname);

  if (invite?.[1]) {
    return { name: "invite", token: decodeURIComponent(invite[1]), authError };
  }

  if (url.pathname === "/recipes/new") {
    return { name: "newRecipe", authError };
  }

  if (recipe?.[1]) {
    return { name: "recipe", recipeId: decodeURIComponent(recipe[1]), authError };
  }

  const section = SECTION_PATHS[url.pathname];

  if (section) {
    return { name: section, authError };
  }

  return { name: "library", authError };
}

function readAuthError(value: string | null): AuthError {
  if (value === "failed" || value === "unconfigured") {
    return value;
  }

  return null;
}
