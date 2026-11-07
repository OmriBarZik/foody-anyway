import type { RecipeView, UserView } from "../../../domain/domain.types";
import styles from "../../app.module.css";
import type { AppRoute } from "../../shell.types";
import { CostsScreen } from "../costs/costs-screen";
import { GuessScreen } from "../guess/guess-screen";
import { IdeasScreen } from "../ideas/ideas-screen";
import { LibraryScreen } from "../library-screen";
import { ProfileScreen } from "../profile/profile-screen";
import { RecipeScreen } from "../recipe-screen";
import { SettingsScreen } from "../settings/settings-screen";
import { ShopScreen } from "../shop/shop-screen";
import { StockScreen } from "../stock-screen";

/** The signed-in page for the current path. */
export function KitchenPages({
  user,
  route,
  go,
  recipes,
  saving,
  errorCode,
  selectedId,
  recipe,
  missing,
  retrying,
  retryError,
  onOpen,
  onSave,
  onRetry,
  onUser,
  onRefresh,
}: {
  user: UserView;
  route: AppRoute;
  go: (path: string) => void;
  recipes: RecipeView[];
  saving: boolean;
  errorCode: string | null;
  selectedId: string | null;
  recipe: RecipeView | null;
  missing: boolean;
  retrying: boolean;
  retryError: string | null;
  onOpen: (recipeId: string) => void;
  onSave: (url: string) => void;
  onRetry: (recipeId: string) => void;
  onUser: (user: UserView) => void;
  onRefresh: () => Promise<void>;
}) {
  if (route.name === "stock") {
    return <StockScreen />;
  }

  if (route.name === "guess") {
    return <GuessScreen />;
  }

  if (route.name === "shop") {
    return <ShopScreen />;
  }

  if (route.name === "ideas") {
    return <IdeasScreen go={go} />;
  }

  if (route.name === "profile") {
    return <ProfileScreen />;
  }

  if (route.name === "settings") {
    return <SettingsScreen user={user} onUser={onUser} go={go} onRefresh={onRefresh} />;
  }

  if (route.name === "costs") {
    return <CostsScreen user={user} />;
  }

  return (
    <div className={route.name === "recipe" ? styles.workspaceRecipe : styles.workspace}>
      <div className={styles.listColumn}>
        <LibraryScreen
          recipes={recipes}
          saving={saving}
          errorCode={errorCode}
          selectedId={selectedId}
          onOpen={onOpen}
          onSave={onSave}
        />
      </div>
      <div className={styles.detailColumn}>
        <RecipeScreen
          recipe={recipe}
          measurement={user.measurement}
          missing={missing}
          retrying={retrying}
          retryError={retryError}
          onBack={() => go("/")}
          onRetry={onRetry}
        />
      </div>
    </div>
  );
}
