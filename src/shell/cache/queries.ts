import { fetchRecipes, fetchStock } from "../api";
import { fetchMembers, fetchProfile, fetchShop, fetchSuggestions } from "../client/household-api";

/** Every cached list, with the request that fills it. Screens that share a key share one request. */
export const queries = {
  recipes: { key: "recipes", load: fetchRecipes },
  stock: { key: "stock", load: fetchStock },
  shop: { key: "shop", load: fetchShop },
  suggestions: { key: "suggestions", load: fetchSuggestions },
  members: { key: "members", load: fetchMembers },
  profile: { key: "profile", load: fetchProfile },
};
