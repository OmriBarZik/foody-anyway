import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { acceptInvite, ApiError, fetchInvite } from "../api";
import styles from "../app.module.css";

/** Shows who invited you and joins that kitchen on purpose. */
export function InviteBanner({ token, onJoined }: { token: string; onJoined: () => void }) {
  const { t } = useTranslation();
  const [householdName, setHouseholdName] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setMissing(false);
    setHouseholdName(null);
    void fetchInvite(token)
      .then((preview) => {
        if (active) {
          setHouseholdName(preview.householdName);
        }
      })
      .catch(() => {
        if (active) {
          setMissing(true);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function join(): Promise<void> {
    setJoining(true);
    setMessage(null);

    try {
      const result = await acceptInvite(token);
      setMessage(result.status === "already" ? t("invite.already") : t("invite.joined"));
      onJoined();
    } catch (error) {
      const code = error instanceof ApiError ? error.code : "invite_missing";
      setMessage(code === "invite_conflict" ? t("invite.conflict") : t("invite.missing"));
    }

    setJoining(false);
  }

  return (
    <section className={styles.invite}>
      {missing ? <p>{t("invite.missing")}</p> : null}
      {householdName ? <p>{t("invite.lead", { name: householdName })}</p> : null}
      {householdName ? (
        <button className={styles.pineButton} type="button" disabled={joining} onClick={() => void join()}>
          {joining ? t("invite.joining") : t("invite.join")}
        </button>
      ) : null}
      {message ? <p>{message}</p> : null}
    </section>
  );
}
