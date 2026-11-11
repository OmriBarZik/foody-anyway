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

/** The form for a recipe written by hand. */
export type NewRecipeRoute = {
  name: "newRecipe";
  authError: AuthError;
};

/** An invite link opened in the browser. */
export type InviteRoute = {
  name: "invite";
  token: string;
  authError: AuthError;
};

/** The shared fridge, freezer, pantry, and spices, plus the screens around them. */
export type SectionName = "stock" | "guess" | "shop" | "ideas" | "me" | "costs";

/** A kitchen screen that is not the video library. */
export type SectionRoute = {
  name: SectionName;
  authError: AuthError;
};

/** Which screen the URL is showing. */
export type AppRoute = LibraryRoute | RecipeRoute | NewRecipeRoute | InviteRoute | SectionRoute;

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
    headline: string;
    lead: string;
    button: string;
    unconfigured: string;
    failed: string;
    invite: string;
  };
  library: {
    title: string;
    search: string;
    all: string;
    readyTonight: string;
    seeAll: string;
    allRecipes: string;
    noMatch: string;
    reading: string;
    needsWork: string;
    everythingIn: string;
    missingCount: string;
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
    backToRecipes: string;
    watchOn: string;
    inKitchen: string;
    out: string;
    outLabel: string;
    addMissing: string;
    addedMissing: string;
    addFailed: string;
    inStock: string;
    outOfStock: string;
    fromSource: string;
    byHand: string;
    sections: string;
    ingredients: string;
    steps: string;
    back: string;
    needsReview: string;
    failed: string;
    pending: string;
    retry: string;
    retrying: string;
    retryInProgress: string;
    retryRateLimited: string;
    retryLimitDaily: string;
    retryFailed: string;
    missing: string;
    openVideo: string;
    timeAndServings: string;
    time: string;
    servings: string;
  };
  settings: {
    title: string;
    language: string;
    measurement: string;
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
    title: string;
    lead: string;
    addItem: string;
    quickCheck: string;
    quickCheckSub: string;
    less: string;
    more: string;
    inKitchenSwitch: string;
    removeItem: string;
    where: string;
    cancel: string;
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
  nav: {
    label: string;
    recipes: string;
    kitchen: string;
    add: string;
    cook: string;
    list: string;
    me: string;
  };
  guess: {
    title: string;
    back: string;
    left: string;
    question: string;
    lead: string;
    have: string;
    skip: string;
    announcedHave: string;
    announcedSkip: string;
    empty: string;
    saveFailed: string;
  };
  shop: {
    title: string;
    left: string;
    addPlaceholder: string;
    forRecipe: string;
    byHand: string;
    name: string;
    amount: string;
    unit: string;
    add: string;
    remove: string;
    empty: string;
    badItem: string;
    saveFailed: string;
  };
  ideas: {
    title: string;
    lead: string;
    ready: string;
    close: string;
    empty: string;
    missing: string;
    addMissing: string;
    added: string;
    note: string;
    saveFailed: string;
    open: string;
  };
  profile: {
    lead: string;
    allergies: string;
    diet: string;
    dislikes: string;
    minutes: string;
    budget: string;
    interests: string;
    none: string;
    add: string;
    save: string;
    saved: string;
    badProfile: string;
    saveFailed: string;
    diets: {
      omnivore: string;
      vegetarian: string;
      vegan: string;
      pescatarian: string;
      kosher: string;
      halal: string;
    };
    budgets: {
      low: string;
      medium: string;
      high: string;
    };
  };
  costs: {
    title: string;
    empty: string;
    forbidden: string;
    total: string;
    loadFailed: string;
  };
  add: {
    title: string;
    close: string;
    link: string;
    placeholder: string;
    detected: string;
    hint: string;
    save: string;
    byHand: string;
  };
  uploads: {
    region: string;
    reading: string;
    readingSub: string;
    failed: string;
    failedSub: string;
    badLink: string;
    ready: string;
    readySub: string;
    retry: string;
    open: string;
    dismiss: string;
    count: string;
    expand: string;
    collapse: string;
  };
  newRecipe: {
    title: string;
    close: string;
    name: string;
    namePlaceholder: string;
    time: string;
    timePlaceholder: string;
    servings: string;
    servingsPlaceholder: string;
    ingredients: string;
    amountN: string;
    amountPlaceholder: string;
    ingredientN: string;
    ingredientPlaceholder: string;
    removeIngredient: string;
    addIngredient: string;
    steps: string;
    stepN: string;
    stepPlaceholder: string;
    removeStep: string;
    addStep: string;
    source: string;
    optional: string;
    sourcePlaceholder: string;
    save: string;
    saving: string;
    bad: string;
    failed: string;
  };
  me: {
    back: string;
    kitchen: string;
    kitchenLead: string;
    you: string;
    owner: string;
    member: string;
    saved: string;
    people: string;
    profile: string;
    settings: string;
    costs: string;
    ownerOnly: string;
    kitchenName: string;
    saveName: string;
    savingName: string;
    nameSaved: string;
    nameFailed: string;
    remove: string;
    removeConfirm: string;
    leave: string;
    leaveConfirm: string;
    removeFailed: string;
  };
  platforms: {
    youtube: string;
    tiktok: string;
    instagram: string;
    pinterest: string;
    manual: string;
  };
};
