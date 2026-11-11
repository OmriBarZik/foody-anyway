import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CostReport } from "../../../admin/admin.types";
import type { UserView } from "../../../domain/domain.types";
import { ApiError } from "../../api";
import app from "../../app.module.css";
import { BackIcon } from "../shell/icons";
import { fetchCosts } from "../../client/household-api";

/** Extraction costs for the app owner. */
export function CostsScreen({ user, go }: { user: UserView; go: (path: string) => void }) {
  const { t } = useTranslation();
  const [report, setReport] = useState<CostReport | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(user.isAdmin ? null : "not_admin");

  useEffect(() => {
    if (!user.isAdmin) {
      return;
    }

    let active = true;
    void fetchCosts()
      .then((next) => {
        if (active) {
          setReport(next);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorCode(error instanceof ApiError ? error.code : "load_failed");
        }
      });

    return () => {
      active = false;
    };
  }, [user.isAdmin]);

  const rows = report?.rows ?? [];
  const back = (
    <a
      href="/me"
      className={app.iconButton}
      aria-label={t("me.back")}
      onClick={(event) => {
        event.preventDefault();
        go("/me");
      }}
    >
      <BackIcon size={22} strokeWidth={2.2} />
    </a>
  );

  return (
    <div className={app.page}>
      {back}
      <header className={app.headerText}>
        <h1 className={app.title}>{t("costs.title")}</h1>
        {report ? <p className={app.eyebrow}>{t("costs.total", { usd: report.totalUsd.toFixed(4) })}</p> : null}
      </header>
      {errorCode === "not_admin" ? <p className={app.empty}>{t("costs.forbidden")}</p> : null}
      {errorCode && errorCode !== "not_admin" ? <p className={app.alert}>{t("costs.loadFailed")}</p> : null}
      {report && rows.length === 0 ? <p className={app.empty}>{t("costs.empty")}</p> : null}
      {rows.length > 0 ? (
        <ul className={`${app.list} ${app.card}`}>
          {rows.map((row) => (
            <li key={row.id} className={app.row}>
              <span className={app.rowText}>
                <span className={app.rowTitle}>{row.recipeTitle || row.recipeId}</span>
                <span className={app.rowSub}>
                  {row.provider} · {row.origin}
                </span>
              </span>
              <span className={app.rowTitle}>${row.usd.toFixed(4)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
