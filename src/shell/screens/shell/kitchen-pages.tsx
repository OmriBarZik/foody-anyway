import type { RecipeView, UserView } from "../../../domain/domain.types";
import type { AppRoute } from "../../shell.types";
import { CostsScreen } from "../costs/costs-screen";
import { GuessScreen } from "../guess/guess-screen";
import { IdeasScreen } from "../ideas/ideas-screen";
import { InviteBanner } from "../invite-banner";
import { LibraryScreen } from "../library/library-screen";
import { MeScreen } from "../me/me-screen";
import { NewRecipeScreen } from "../new-recipe/new-recipe-screen";
import { RecipeScreen } from "../recipe/recipe-screen";
import { ShopScreen } from "../shop/shop-screen";
import { StockScreen } from "../stock/stock-screen";

/** The signed-in page for the current path. */
export function KitchenPages({
  user,
  route,
  go,
  recipes,
  recipesLoading,
  loadFailed,
  recipe,
  missing,
  retrying,
  retryError,
  onRetry,
  onCreated,
  onUser,
  onRefresh,
}: {
  user: UserView;
  route: AppRoute;
  go: (path: string) => void;
  recipes: RecipeView[];
  recipesLoading: boolean;
  loadFailed: boolean;
  recipe: RecipeView | null;
  missing: boolean;
  retrying: boolean;
  retryError: string | null;
  onRetry: (recipeId: string) => void;
  onCreated: (recipe: RecipeView) => void;
  onUser: (user: UserView) => void;
  onRefresh: () => Promise<void>;
}) {
  if (route.name === "stock") {
    return <StockScreen go={go} />;
  }

  if (route.name === "guess") {
    return <GuessScreen go={go} />;
  }

  if (route.name === "shop") {
    return <ShopScreen />;
  }

  if (route.name === "ideas") {
    return <IdeasScreen go={go} />;
  }

  if (route.name === "me") {
    return <MeScreen user={user} recipes={recipes} go={go} onUser={onUser} onRefresh={onRefresh} />;
  }

  if (route.name === "costs") {
    return <CostsScreen user={user} go={go} />;
  }

  if (route.name === "newRecipe") {
    return <NewRecipeScreen go={go} onCreated={onCreated} />;
  }

  if (route.name === "recipe") {
    return (
      <RecipeScreen
        recipe={recipe}
        measurement={user.measurement}
        missing={missing}
        retrying={retrying}
        retryError={retryError}
        go={go}
        onRetry={onRetry}
      />
    );
  }

  return (
    <>
      {route.name === "invite" ? (
        <InviteBanner token={route.token} onJoined={() => void onRefresh().then(() => go("/"))} />
      ) : null}
      <LibraryScreen user={user} recipes={recipes} loading={recipesLoading} loadFailed={loadFailed} go={go} />
    </>
  );
}
