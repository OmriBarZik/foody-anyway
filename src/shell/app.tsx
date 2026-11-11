import { useSession } from "./use-session";
import { useRoute } from "./use-route";
import { Kitchen } from "./screens/shell/kitchen";
import { SignIn } from "./screens/sign-in";
import { BootSkeleton } from "./screens/skeleton/boot-skeleton";

/** Foody shell: sign-in, then the shared kitchen. */
export function App() {
  const session = useSession();
  const { route, go } = useRoute();

  if (session.status === "loading") {
    return <BootSkeleton />;
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
