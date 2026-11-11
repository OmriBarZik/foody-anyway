import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { RecipeView, UserView } from "../../../domain/domain.types";
import type { MemberView } from "../../../household/household.types";
import { createInvite } from "../../api";
import app from "../../app.module.css";
import { fetchMembers } from "../../client/household-api";
import type { InviteButtonState } from "../../shell.types";
import { InviteIcon } from "../shell/icons";
import { initials } from "../shell/user-avatar";
import styles from "./me.module.css";

/** Who shares this kitchen, how many recipes each has saved, and the invite link. */
export function MembersCard({ user, recipes }: { user: UserView; recipes: RecipeView[] }) {
  const { t } = useTranslation();
  const [members, setMembers] = useState<MemberView[]>([]);
  const [inviteState, setInviteState] = useState<InviteButtonState>("idle");

  useEffect(() => {
    let active = true;
    void fetchMembers()
      .then((next) => {
        if (active) {
          setMembers(next);
        }
      })
      // Without the list the card still shows the invite button.
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [user.household.id]);

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
          </li>
        ))}
        <li>
          <button type="button" className={styles.invite} onClick={() => void invite()} aria-live="polite">
            <InviteIcon size={20} strokeWidth={2.2} />
            {inviteLabel}
          </button>
        </li>
      </ul>
    </section>
  );
}
