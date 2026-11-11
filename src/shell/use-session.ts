import { useCallback, useEffect, useState } from "react";
import type { UserView } from "../domain/domain.types";
import { fetchConfig, fetchMe } from "./api";
import { prefetch } from "./cache/use-cached";
import { queries } from "./cache/queries";
import type { SessionState } from "./shell.types";

/** Load Google availability and the signed-in account. */
export function useSession(): SessionState {
  const [status, setStatus] = useState<SessionState["status"]>("loading");
  const [user, setUser] = useState<UserView | null>(null);
  const [google, setGoogle] = useState(false);

  const refresh = useCallback(async () => {
    // Ask for the config and the account together instead of one after the other.
    const [config, me] = await Promise.allSettled([fetchConfig(), fetchMe()]);

    if (config.status === "rejected") {
      setStatus("error");

      return;
    }

    setGoogle(config.value.google);

    if (me.status === "rejected") {
      setUser(null);
      setStatus("error");

      return;
    }

    setUser(me.value);
    setStatus(me.value ? "ready" : "signedOut");
  }, []);

  useEffect(() => {
    // Most visits are signed in, so start on the recipes while the account loads.
    void prefetch(queries.recipes);
    void refresh();
  }, [refresh]);

  return { status, user, google, refresh, updateUser: setUser };
}
