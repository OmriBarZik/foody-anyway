import type { UserView } from "../domain/domain.types";

/** Why Google sent the browser back without a session. */
export type AuthError = "failed" | "unconfigured" | null;

/** The kitchen list, including a failed sign-in flag on the query string. */
export type LibraryRoute = {
  name: "library";
  authError: AuthError;
};

/** One saved video. */
export type RecipeRoute = {
  name: "recipe";
  recipeId: string;
  authError: AuthError;
};

/** An invite link opened in the browser. */
export type InviteRoute = {
  name: "invite";
  token: string;
  authError: AuthError;
};

/** The shared fridge, freezer, pantry, and spices. */
export type StockRoute = {
  name: "stock";
  authError: AuthError;
};

/** Which screen the URL is showing. */
export type AppRoute = LibraryRoute | RecipeRoute | InviteRoute | StockRoute;

/** Path plus a function that moves to another path without a reload. */
export type RouteState = {
  route: AppRoute;
  go: (path: string) => void;
};

/** Signed-in or signed-out state for the shell. */
export type SessionState = {
  status: "loading" | "signedOut" | "ready" | "error";
  user: UserView | null;
  google: boolean;
  refresh: () => Promise<void>;
  updateUser: (user: UserView) => void;
};

/** Invite button after someone asks for a link. */
export type InviteButtonState = "idle" | "copied" | "failed";

/** English and Hebrew strings. Both objects must match this shape. */
export type UiCopy = {
  kitchen: string;
  status: {
    loading: string;
    loadFailed: string;
    retry: string;
  };
  signIn: {
    lead: string;
    button: string;
    unconfigured: string;
    failed: string;
    invite: string;
  };
  library: {
    pasteLabel: string;
    save: string;
    saving: string;
    empty: string;
    choose: string;
    savedBy: string;
    badLink: string;
    saveFailed: string;
  };
  recipe: {
    ingredients: string;
    steps: string;
    back: string;
    needsReview: string;
    failed: string;
    pending: string;
    missing: string;
    openVideo: string;
    timeAndServings: string;
    time: string;
    servings: string;
  };
  settings: {
    english: string;
    hebrew: string;
    metric: string;
    imperial: string;
    signOut: string;
    failed: string;
  };
  invite: {
    create: string;
    copied: string;
    copyFailed: string;
    lead: string;
    join: string;
    joining: string;
    joined: string;
    already: string;
    conflict: string;
    missing: string;
  };
  stock: {
    videos: string;
    nav: string;
    name: string;
    amount: string;
    unit: string;
    add: string;
    remove: string;
    have: string;
    missingItem: string;
    empty: string;
    badItem: string;
    saveFailed: string;
    locations: {
      fridge: string;
      freezer: string;
      pantry: string;
      spices: string;
    };
  };
  platforms: {
    youtube: string;
    tiktok: string;
    instagram: string;
    pinterest: string;
  };
};
