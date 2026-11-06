import { useCallback, useEffect, useState } from "react";
import type { UserView } from "../domain/domain.types";
import { fetchConfig, fetchMe } from "./api";
import type { SessionState } from "./shell.types";

/** Load Google availability and the signed-in account. */
export function useSession(): SessionState {
  const [status, setStatus] = useState<SessionState["status"]>("loading");
  const [user, setUser] = useState<UserView | null>(null);
  const [google, setGoogle] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const config = await fetchConfig();
      setGoogle(config.google);
    } catch {
      setStatus("error");

      return;
    }

    try {
      const me = await fetchMe();
      setUser(me);
      setStatus(me ? "ready" : "signedOut");
    } catch {
      setUser(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, user, google, refresh, updateUser: setUser };
}
