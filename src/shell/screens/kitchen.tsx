import { useEffect, useState } from "react";
import type { RecipeView, UserView } from "../../domain/domain.types";
import { ApiError, fetchRecipe, fetchRecipes, saveRecipe } from "../api";
import styles from "../app.module.css";
import type { AppRoute } from "../shell.types";
import { InviteBanner } from "./invite-banner";
import { KitchenNav } from "./nav/kitchen-nav";
import { KitchenPages } from "./nav/kitchen-pages";
import { TopBar } from "./top-bar";

/** The signed-in kitchen: paste a video, then read it. */
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
  const [saving, setSaving] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [opened, setOpened] = useState<RecipeView | null>(null);
  const [missing, setMissing] = useState(false);
  const selectedId = route.name === "recipe" ? route.recipeId : null;
  const listed = recipes.find((recipe) => recipe.id === selectedId) ?? null;
  const recipe = listed ?? (opened?.id === selectedId ? opened : null);

  useEffect(() => {
    let active = true;
    void fetchRecipes()
      .then((next) => {
        if (active) {
          setRecipes(next);
        }
      })
      .catch(() => {
        if (active) {
          setErrorCode("load_failed");
        }
      });

    return () => {
      active = false;
    };
  }, [user.household.id]);

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

  async function onSave(url: string): Promise<void> {
    setSaving(true);
    setErrorCode(null);

    try {
      const saved = await saveRecipe(url);
      setRecipes(await fetchRecipes());
      go(`/recipes/${saved.id}`);
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : "save_failed");
    }

    setSaving(false);
  }

  return (
    <main className={styles.shell}>
      <div className={styles.rail}>
        <TopBar user={user} />
        <KitchenNav user={user} route={route} go={go} />
      </div>
      <div className={styles.stage}>
        {route.name === "invite" ? (
          <InviteBanner token={route.token} onJoined={() => void onRefresh().then(() => go("/"))} />
        ) : null}
        <div key={stageName(route)} className={styles.stageIn}>
          <KitchenPages
            user={user}
            route={route}
            go={go}
            recipes={recipes}
            saving={saving}
            errorCode={errorCode}
            selectedId={selectedId}
            recipe={recipe}
            missing={missing}
            onOpen={(recipeId) => go(`/recipes/${recipeId}`)}
            onSave={(url) => void onSave(url)}
            onUser={onUser}
            onRefresh={onRefresh}
          />
        </div>
      </div>
    </main>
  );
}

function stageName(route: AppRoute): string {
  if (route.name === "library" || route.name === "recipe" || route.name === "invite") {
    return "library";
  }

  return route.name;
}
