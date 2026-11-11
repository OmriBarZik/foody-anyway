/** English or Hebrew, the two languages the shell ships with. */
export type Locale = "en" | "he";

/** How ingredient amounts are shown for one person. */
export type MeasurementSystem = "metric" | "imperial";

/** A cooking video source the library accepts. */
export type VideoPlatform = "youtube" | "tiktok" | "instagram" | "pinterest";

/** Where a saved recipe came from: a video link, or written by hand. */
export type RecipePlatform = VideoPlatform | "manual";

/** How far reading a saved link got. */
export type ExtractionStatus = "pending" | "ready" | "needs_review" | "failed";

/** Unit system stored on one ingredient line. */
export type IngredientSystem = MeasurementSystem | "none";

/** One ingredient, with names for both UI languages. */
export type Ingredient = {
  name: string;
  nameEn: string | null;
  nameHe: string | null;
  amount: number | null;
  unit: string | null;
  system: IngredientSystem;
  note: string | null;
};

/** One step in the language of the video. */
export type RecipeStep = {
  order: number;
  text: string;
};

/** The kitchen a membership points at. */
export type HouseholdView = {
  id: string;
  name: string;
};

/** The signed-in person, including the settings that are theirs alone. */
export type UserView = {
  id: string;
  name: string;
  email: string;
  pictureUrl: string | null;
  locale: Locale;
  measurement: MeasurementSystem;
  isAdmin: boolean;
  household: HouseholdView;
};

/** A saved video as the app shows it. */
export type RecipeView = {
  id: string;
  sourceUrl: string;
  platform: RecipePlatform;
  sourceNote: string | null;
  thumbnailUrl: string | null;
  dishImageUrl: string | null;
  title: string | null;
  servings: string | null;
  cookTime: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  sourceLanguage: string | null;
  sourceMeasurement: IngredientSystem | "mixed" | null;
  extractionStatus: ExtractionStatus;
  extractionNote: string | null;
  savedByName: string;
  createdAt: string;
};

/** Whether Google sign-in is configured on this server. */
export type PublicConfig = {
  google: boolean;
};

/** Result of accepting an invite. */
export type AcceptInviteResult = {
  status: "joined" | "already";
  user: UserView;
};

/** An invite link the household can send. */
export type InviteLink = {
  url: string;
};

/** The kitchen name shown before someone accepts an invite. */
export type InvitePreview = {
  householdName: string;
};

/** Ingredient amount after unit conversion, ready to render. */
export type DisplayAmount = {
  amountLabel: string | null;
  name: string;
};

/** Where a household keeps food. Spices are present or absent; the others have an amount. */
export type StockLocation = "fridge" | "freezer" | "pantry" | "spices";

/** One thing in the shared kitchen. */
export type StockItemView = {
  id: string;
  location: StockLocation;
  name: string;
  amount: number | null;
  unit: string | null;
  present: boolean | null;
};
