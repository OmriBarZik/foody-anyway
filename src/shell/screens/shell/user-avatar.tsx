import { useTranslation } from "react-i18next";
import type { UserView } from "../../../domain/domain.types";
import app from "../../app.module.css";

/** The signed-in person's picture or initials. Opens profile and settings. */
export function UserAvatar({ user, go }: { user: UserView; go: (path: string) => void }) {
  const { t } = useTranslation();

  return (
    <a
      href="/me"
      className={app.avatar}
      aria-label={t("nav.me")}
      onClick={(event) => {
        event.preventDefault();
        go("/me");
      }}
    >
      {user.pictureUrl ? <img src={user.pictureUrl} alt="" referrerPolicy="no-referrer" /> : initials(user.name)}
    </a>
  );
}

/** Up to two initials from a name. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
