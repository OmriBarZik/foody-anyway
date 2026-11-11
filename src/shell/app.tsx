import { useTranslation } from "react-i18next";
import { useSession } from "./use-session";
import { useRoute } from "./use-route";
import styles from "./app.module.css";
import { Kitchen } from "./screens/shell/kitchen";
import { SignIn } from "./screens/sign-in";

/** Foody shell: sign-in, then the shared kitchen. */
export function App() {
  const { t } = useTranslation();
  const session = useSession();
  const { route, go } = useRoute();

  if (session.status === "loading") {
    return (
      <main className={styles.loading}>
        <p>{t("status.loading")}</p>
      </main>
    );
  }

  if (!session.user) {
    return (
      <SignIn
        google={session.google}
        route={route}
        loadError={session.status === "error"}
        onRetry={() => void session.refresh()}
      />
    );
  }

  return <Kitchen user={session.user} route={route} go={go} onUser={session.updateUser} onRefresh={session.refresh} />;
}
