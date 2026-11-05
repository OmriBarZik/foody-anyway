import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Locale, MeasurementSystem, RecipeView, UserView } from "../../domain/domain.types";
import { ApiError, createInvite, fetchRecipe, fetchRecipes, saveRecipe, signOut, updateMe } from "../api";
import styles from "../app.module.css";
import { applyLocale } from "../i18n";
import type { AppRoute, InviteButtonState } from "../shell.types";
import { InviteBanner } from "./invite-banner";
import { LibraryScreen } from "./library-screen";
import { RecipeScreen } from "./recipe-screen";
import { StockScreen } from "./stock-screen";
import { TopBar } from "./top-bar";

/** The signed-in kitchen: paste a video, read it, invite someone. */
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
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<RecipeView[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [inviteState, setInviteState] = useState<InviteButtonState>("idle");
  const [opened, setOpened] = useState<RecipeView | null>(null);
  const [missing, setMissing] = useState(false);
  const [settingsFailed, setSettingsFailed] = useState(false);
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

  async function onLocale(locale: Locale): Promise<void> {
    const previous = user.locale;
    setSettingsFailed(false);
    await applyLocale(locale);

    try {
      onUser(await updateMe({ locale }));
    } catch {
      setSettingsFailed(true);
      await applyLocale(previous);
    }
  }

  async function onMeasurement(measurement: MeasurementSystem): Promise<void> {
    setSettingsFailed(false);

    try {
      onUser(await updateMe({ measurement }));
    } catch {
      setSettingsFailed(true);
    }
  }

  async function onInvite(): Promise<void> {
    try {
      const link = await createInvite();
      await navigator.clipboard.writeText(link.url);
      setInviteState("copied");
    } catch {
      setInviteState("failed");
    }
  }

  async function onSignOut(): Promise<void> {
    await signOut();
    go("/");
    await onRefresh();
  }

  return (
    <main className={styles.page}>
      <TopBar
        user={user}
        inviteState={inviteState}
        onLocale={(locale) => void onLocale(locale)}
        onMeasurement={(measurement) => void onMeasurement(measurement)}
        onInvite={() => void onInvite()}
        onSignOut={() => void onSignOut()}
      />
      {settingsFailed ? <p className={styles.alert}>{t("settings.failed")}</p> : null}
      <nav className={styles.nav}>
        <button
          type="button"
          className={styles.choice}
          aria-current={route.name === "stock" ? undefined : "page"}
          onClick={() => go("/")}
        >
          {t("stock.videos")}
        </button>
        <button
          type="button"
          className={styles.choice}
          aria-current={route.name === "stock" ? "page" : undefined}
          onClick={() => go("/stock")}
        >
          {t("stock.nav")}
        </button>
      </nav>
      {route.name === "invite" ? (
        <InviteBanner token={route.token} onJoined={() => void onRefresh().then(() => go("/"))} />
      ) : null}
      {route.name === "stock" ? (
        <StockScreen />
      ) : (
        <div className={route.name === "recipe" ? styles.workspaceRecipe : styles.workspace}>
          <div className={styles.listColumn}>
            <LibraryScreen
              recipes={recipes}
              saving={saving}
              errorCode={errorCode}
              selectedId={selectedId}
              onOpen={(recipeId) => go(`/recipes/${recipeId}`)}
              onSave={(url) => void onSave(url)}
            />
          </div>
          <div className={styles.detailColumn}>
            <RecipeScreen recipe={recipe} measurement={user.measurement} missing={missing} onBack={() => go("/")} />
          </div>
        </div>
      )}
    </main>
  );
}
