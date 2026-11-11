import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { queries } from "../../cache/queries";
import { useCached } from "../../cache/use-cached";
import type { UserView } from "../../../domain/domain.types";
import app from "../../app.module.css";
import { renameKitchen } from "../../client/household-api";
import styles from "./me.module.css";

const NAME_MAX_LENGTH = 60;

/** The kitchen's name. Everyone sees it; only the owner can change it. */
export function KitchenNameCard({ user, onUser }: { user: UserView; onUser: (user: UserView) => void }) {
  const { t } = useTranslation();
  // Same request as the members card, so this costs nothing extra.
  const { data: members } = useCached(queries.members);
  const isOwner = members?.some((member) => member.id === user.id && member.role === "owner") ?? false;
  const [name, setName] = useState(user.household.name);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  useEffect(() => {
    setName(user.household.name);
  }, [user.household.name]);

  async function save(): Promise<void> {
    setState("saving");

    try {
      onUser(await renameKitchen(name.trim()));
      setState("saved");
    } catch {
      setState("failed");
    }
  }

  const unchanged = name.trim() === user.household.name || name.trim() === "";

  return (
    <form
      className={styles.section}
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <label className={app.sectionTitle} htmlFor="kitchen-name">
        {t("me.kitchenName")}
      </label>
      {state === "failed" ? (
        <p className={app.alert} role="alert">
          {t("me.nameFailed")}
        </p>
      ) : null}
      {state === "saved" ? <p role="status">{t("me.nameSaved")}</p> : null}
      <div className={`${app.card} ${styles.nameRow}`}>
        <input
          id="kitchen-name"
          className={styles.nameField}
          value={name}
          maxLength={NAME_MAX_LENGTH}
          readOnly={!isOwner}
          onChange={(event) => {
            setName(event.target.value);
            setState("idle");
          }}
        />
        {isOwner ? null : <span className={app.rowSub}>{t("me.ownerOnly")}</span>}
        <button type="submit" className={styles.nameSave} disabled={!isOwner || unchanged || state === "saving"}>
          {state === "saving" ? t("me.savingName") : t("me.saveName")}
        </button>
      </div>
    </form>
  );
}
