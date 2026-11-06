import { useTranslation } from "react-i18next";
import type { UserView } from "../../../domain/domain.types";
import styles from "../../app.module.css";
import type { AppRoute, SectionName } from "../../shell.types";

/** Videos, stock, guess, shop, ideas, profile, settings, and costs for the owner. */
export function KitchenNav({ user, route, go }: { user: UserView; route: AppRoute; go: (path: string) => void }) {
  const { t } = useTranslation();
  const links: { name: SectionName | "library"; path: string; label: string }[] = [
    { name: "library", path: "/", label: t("nav.videos") },
    { name: "stock", path: "/stock", label: t("nav.stock") },
    { name: "guess", path: "/guess", label: t("nav.guess") },
    { name: "shop", path: "/shop", label: t("nav.shop") },
    { name: "ideas", path: "/ideas", label: t("nav.ideas") },
    { name: "profile", path: "/profile", label: t("nav.profile") },
    { name: "settings", path: "/settings", label: t("nav.settings") },
  ];

  if (user.isAdmin) {
    links.push({ name: "costs", path: "/costs", label: t("nav.costs") });
  }

  return (
    <nav className={styles.nav} aria-label={t("nav.label")}>
      {links.map((link) => (
        <button
          key={link.path}
          type="button"
          className={styles.tab}
          aria-current={isCurrent(route, link.name) ? "page" : undefined}
          onClick={() => go(link.path)}
        >
          {link.label}
        </button>
      ))}
    </nav>
  );
}

function isCurrent(route: AppRoute, name: SectionName | "library"): boolean {
  if (name === "library") {
    return route.name === "library" || route.name === "recipe" || route.name === "invite";
  }

  return route.name === name;
}
