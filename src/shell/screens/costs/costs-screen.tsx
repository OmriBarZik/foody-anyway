import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CostReport } from "../../../admin/admin.types";
import type { UserView } from "../../../domain/domain.types";
import { ApiError } from "../../api";
import styles from "../../app.module.css";
import { fetchCosts } from "../../client/household-api";

/** Extraction costs for the app owner. */
export function CostsScreen({ user }: { user: UserView }) {
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

  if (errorCode === "not_admin") {
    return <p>{t("costs.forbidden")}</p>;
  }

  if (errorCode) {
    return <p className={styles.alert}>{t("costs.loadFailed")}</p>;
  }

  const rows = report?.rows ?? [];

  return (
    <section className={styles.stack}>
      <h2 className={styles.sectionTitle}>{t("costs.title")}</h2>
      {report ? <p>{t("costs.total", { usd: report.totalUsd.toFixed(4) })}</p> : null}
      {report && rows.length === 0 ? <p>{t("costs.empty")}</p> : null}
      <ul className={styles.stockList}>
        {rows.map((row) => (
          <li key={row.id} className={styles.stockRow}>
            <span>{row.recipeTitle || row.recipeId}</span>
            <span>
              {row.origin} · ${row.usd.toFixed(4)}
            </span>
            <span>{row.provider}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
