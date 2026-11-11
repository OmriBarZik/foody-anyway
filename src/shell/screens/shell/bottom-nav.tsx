import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { AppRoute } from "../../shell.types";
import { CookIcon, KitchenIcon, ListIcon, PlusIcon, RecipesIcon } from "./icons";
import styles from "./shell.module.css";
import { prefetchFor } from "./use-prefetch-tabs";

type Tab = {
  path: string;
  label: string;
  current: boolean;
  icon: ReactNode;
};

/** Recipes, Kitchen, the add button, Cook, and List. */
export function BottomNav({ route, go, onAdd }: { route: AppRoute; go: (path: string) => void; onAdd: () => void }) {
  const { t } = useTranslation();
  const tabs: Tab[] = [
    {
      path: "/",
      label: t("nav.recipes"),
      current: route.name === "library" || route.name === "invite",
      icon: <RecipesIcon />,
    },
    { path: "/stock", label: t("nav.kitchen"), current: route.name === "stock", icon: <KitchenIcon /> },
  ];
  const after: Tab[] = [
    { path: "/ideas", label: t("nav.cook"), current: route.name === "ideas", icon: <CookIcon /> },
    { path: "/shop", label: t("nav.list"), current: route.name === "shop", icon: <ListIcon /> },
  ];

  return (
    <nav className={styles.nav} aria-label={t("nav.label")}>
      <div className={styles.navInner}>
        {tabs.map((tab) => (
          <NavTab key={tab.path} tab={tab} go={go} />
        ))}
        <div className={styles.addSlot}>
          <button type="button" className={styles.addButton} aria-label={t("nav.add")} onClick={onAdd}>
            <PlusIcon size={26} strokeWidth={2.5} />
          </button>
        </div>
        {after.map((tab) => (
          <NavTab key={tab.path} tab={tab} go={go} />
        ))}
      </div>
    </nav>
  );
}

function NavTab({ tab, go }: { tab: Tab; go: (path: string) => void }) {
  return (
    <a
      href={tab.path}
      className={styles.tab}
      aria-current={tab.current ? "page" : undefined}
      onPointerDown={() => prefetchFor(tab.path)}
      onClick={(event) => {
        event.preventDefault();
        go(tab.path);
      }}
    >
      <span className={styles.tabIcon}>{tab.icon}</span>
      {tab.label}
    </a>
  );
}
