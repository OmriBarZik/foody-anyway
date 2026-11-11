import { useTranslation } from "react-i18next";
import type { RecipeView, UserView } from "../../../domain/domain.types";
import app from "../../app.module.css";
import { BackIcon } from "../shell/icons";
import { initials } from "../shell/user-avatar";
import { MembersCard } from "./members-card";
import styles from "./me.module.css";
import { ProfileCard } from "./profile-card";
import { SettingsCard } from "./settings-card";

/** The person, their kitchen and who shares it, their food profile, and their settings. */
export function MeScreen({
  user,
  recipes,
  go,
  onUser,
  onRefresh,
}: {
  user: UserView;
  recipes: RecipeView[];
  go: (path: string) => void;
  onUser: (user: UserView) => void;
  onRefresh: () => Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <div className={app.page}>
      <a
        href="/"
        className={app.iconButton}
        aria-label={t("me.back")}
        onClick={(event) => {
          event.preventDefault();
          go("/");
        }}
      >
        <span className={styles.flip}>
          <BackIcon size={22} strokeWidth={2.2} />
        </span>
      </a>
      <header className={styles.person}>
        <span className={styles.bigAvatar}>
          {user.pictureUrl ? <img src={user.pictureUrl} alt="" referrerPolicy="no-referrer" /> : initials(user.name)}
        </span>
        <div className={app.headerText}>
          <h1 className={styles.name}>{user.name}</h1>
          <p className={app.eyebrow}>{user.email}</p>
        </div>
      </header>
      <MembersCard user={user} recipes={recipes} />
      <ProfileCard />
      <SettingsCard user={user} go={go} onUser={onUser} onRefresh={onRefresh} />
    </div>
  );
}
