import { useEffect, useState } from "react";
import { queries } from "../../cache/queries";
import { clearCache, useCached } from "../../cache/use-cached";
import { useTranslation } from "react-i18next";
import type { RecipeView, UserView } from "../../../domain/domain.types";
import type { MemberView } from "../../../household/household.types";
import { createInvite } from "../../api";
import { removeMember } from "../../client/household-api";
import app from "../../app.module.css";
import type { InviteButtonState } from "../../shell.types";
import { CloseIcon, InviteIcon } from "../shell/icons";
import { initials } from "../shell/user-avatar";
import styles from "./me.module.css";

/** Who shares this kitchen, the invite link, and removing people or leaving. Only the owner removes others. */
export function MembersCard({
  user,
  recipes,
  onUser,
}: {
  user: UserView;
  recipes: RecipeView[];
  onUser: (user: UserView) => void;
}) {
  const { t } = useTranslation();
  // Without the list the card still shows the invite button.
  const { data, reload } = useCached(queries.members);
  const members: MemberView[] = data ?? [];
  const [inviteState, setInviteState] = useState<InviteButtonState>("idle");
  const [failed, setFailed] = useState(false);
  const isOwner = members.some((member) => member.id === user.id && member.role === "owner");

  useEffect(() => {
    reload();
  }, [reload, user.household.id]);

  async function invite(): Promise<void> {
    setInviteState("idle");

    try {
      const link = await createInvite();
      await navigator.clipboard.writeText(link.url);
      setInviteState("copied");
    } catch {
      setInviteState("failed");
    }
  }

  async function remove(member: MemberView): Promise<void> {
    const leaving = member.id === user.id;

    if (!window.confirm(leaving ? t("me.leaveConfirm") : t("me.removeConfirm", { name: member.name }))) {
      return;
    }

    setFailed(false);

    try {
      const updated = await removeMember(member.id);

      if (leaving) {
        // The kitchen's stock, list and recipes are no longer theirs.
        clearCache();
        onUser(updated);
      } else {
        reload();
      }
    } catch {
      setFailed(true);
    }
  }

  const inviteLabel =
    inviteState === "copied"
      ? t("invite.copied")
      : inviteState === "failed"
        ? t("invite.copyFailed")
        : t("invite.create");

  return (
    <section className={styles.section}>
      <div className={app.headerText}>
        <h2 className={app.sectionTitle}>{t("me.kitchen")}</h2>
        <p className={app.lead}>
          {user.household.name}
          {members.length > 0 ? ` · ${t("me.people", { count: members.length })}` : null}
        </p>
      </div>
      {failed ? (
        <p className={app.alert} role="alert">
          {t("me.removeFailed")}
        </p>
      ) : null}
      <ul className={`${app.list} ${app.card}`}>
        {members.map((member) => (
          <li key={member.id} className={app.row}>
            <span className={member.id === user.id ? styles.memberMe : styles.member}>
              {member.pictureUrl ? (
                <img src={member.pictureUrl} alt="" referrerPolicy="no-referrer" />
              ) : (
                initials(member.name)
              )}
            </span>
            <span className={app.rowText}>
              <span className={app.rowTitle}>
                {member.id === user.id ? t("me.you", { name: member.name }) : member.name}
              </span>
              <span className={app.rowSub}>
                {member.role === "owner" ? t("me.owner") : t("me.member")} ·{" "}
                {t("me.saved", { count: recipes.filter((recipe) => recipe.savedByName === member.name).length })}
              </span>
            </span>
            {isOwner && member.id !== user.id ? (
              <button
                type="button"
                className={styles.remove}
                aria-label={t("me.remove", { name: member.name })}
                onClick={() => void remove(member)}
              >
                <CloseIcon size={18} strokeWidth={2.2} />
              </button>
            ) : null}
          </li>
        ))}
        <li>
          <button type="button" className={styles.invite} onClick={() => void invite()} aria-live="polite">
            <InviteIcon size={20} strokeWidth={2.2} />
            {inviteLabel}
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`${styles.invite} ${styles.leave}`}
            onClick={() => void remove({ id: user.id, name: user.name, pictureUrl: null, role: "member" })}
          >
            {t("me.leave")}
          </button>
        </li>
      </ul>
    </section>
  );
}
