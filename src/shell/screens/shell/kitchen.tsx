import { useCallback, useEffect, useState } from "react";
import type { RecipeView, UserView } from "../../../domain/domain.types";
import { ApiError, fetchRecipe, fetchRecipes, retryRecipe } from "../../api";
import type { AppRoute } from "../../shell.types";
import { AddSheet } from "../add/add-sheet";
import { UploadAlerts } from "../uploads/upload-alerts";
import { useUploads } from "../uploads/use-uploads";
import { BottomNav } from "./bottom-nav";
import { KitchenPages } from "./kitchen-pages";
import styles from "./shell.module.css";

const NAV_SCREENS: AppRoute["name"][] = ["library", "invite", "stock", "shop", "ideas"];
const QUIET_SCREENS: AppRoute["name"][] = ["guess", "newRecipe"];

/** The signed-in kitchen: the page for the path, the bottom bar, the add card, and background alerts. */
export function Kitchen({
  user,
  route,
  go,
  onUser,
  onRefresh,
}: {
  user: UserView;
  route: AppRoute;
  go: (path: string) => void;
  onUser: (user: UserView) => void;
  onRefresh: () => Promise<void>;
}) {
  const [recipes, setRecipes] = useState<RecipeView[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [opened, setOpened] = useState<RecipeView | null>(null);
  const [missing, setMissing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const selectedId = route.name === "recipe" ? route.recipeId : null;
  const listed = recipes.find((recipe) => recipe.id === selectedId) ?? null;
  const recipe = listed ?? (opened?.id === selectedId ? opened : null);

  const reload = useCallback(() => {
    void fetchRecipes()
      .then((next) => {
        setRecipes(next);
        setLoadFailed(false);
      })
      .catch(() => setLoadFailed(true));
  }, []);

  const uploads = useUploads({ onSaved: reload });

  useEffect(() => {
    reload();
  }, [reload, user.household.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setRetryError(null);
  }, [route.name, selectedId]);

  useEffect(() => {
    if (!selectedId || listed) {
      return;
    }

    let active = true;
    setMissing(false);
    void fetchRecipe(selectedId)
      .then((next) => {
        if (active) {
          setOpened(next);
        }
      })
      .catch((error: unknown) => {
        if (active && error instanceof ApiError && error.code === "not_found") {
          setMissing(true);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedId, listed]);

  async function onRetry(recipeId: string): Promise<void> {
    setRetrying(true);
    setRetryError(null);

    try {
      setOpened(await retryRecipe(recipeId));
      reload();
    } catch (error) {
      setRetryError(error instanceof ApiError ? error.code : "save_failed");
    }

    setRetrying(false);
  }

  const showNav = NAV_SCREENS.includes(route.name);

  return (
    <main className={styles.shell}>
      <KitchenPages
        user={user}
        route={route}
        go={go}
        recipes={recipes}
        loadFailed={loadFailed}
        recipe={recipe}
        missing={missing}
        retrying={retrying}
        retryError={retryError}
        onRetry={(recipeId) => void onRetry(recipeId)}
        onCreated={(created) => {
          setOpened(created);
          reload();
          go(`/recipes/${created.id}`);
        }}
        onUser={onUser}
        onRefresh={onRefresh}
      />
      {QUIET_SCREENS.includes(route.name) ? null : (
        <UploadAlerts
          key={route.name}
          controls={uploads}
          raised={showNav}
          onOpen={(recipeId) => go(`/recipes/${recipeId}`)}
        />
      )}
      {showNav ? <BottomNav route={route} go={go} onAdd={() => setAdding(true)} /> : null}
      {adding ? (
        <AddSheet
          onClose={() => setAdding(false)}
          onSave={(url) => {
            setAdding(false);
            uploads.start(url);

            if (route.name !== "library") {
              go("/");
            }
          }}
          onHand={() => {
            setAdding(false);
            go("/recipes/new");
          }}
        />
      ) : null}
    </main>
  );
}
