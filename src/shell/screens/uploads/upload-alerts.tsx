import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DownIcon, UpIcon } from "../shell/icons";
import type { Upload, UploadControls } from "./uploads.types";
import { UploadAlert } from "./upload-alert";
import styles from "./upload-alerts.module.css";

const ORDER: Record<Upload["status"], number> = { failed: 0, reading: 1, ready: 2 };

/**
 * Floating alerts for links being read. One shows on its own. Several fold into a stack
 * with the most urgent on top, and open into a list.
 */
export function UploadAlerts({
  controls,
  raised,
  onOpen,
}: {
  controls: UploadControls;
  raised: boolean;
  onOpen: (recipeId: string) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { uploads, retry, dismiss } = controls;

  if (uploads.length === 0) {
    return null;
  }

  const sorted = [...uploads].sort((left, right) => ORDER[left.status] - ORDER[right.status]);
  const top = sorted[0];
  const position = raised ? styles.raised : styles.low;

  if (!top) {
    return null;
  }

  if (uploads.length > 1 && expanded) {
    return (
      <section className={`${styles.region} ${position}`} aria-label={t("uploads.region")}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span>{t("uploads.count", { count: uploads.length })}</span>
            <button
              type="button"
              className={styles.pill}
              aria-label={t("uploads.collapse")}
              onClick={() => setExpanded(false)}
            >
              <DownIcon size={16} strokeWidth={2.6} />
            </button>
          </div>
          {uploads.map((upload) => (
            <UploadAlert key={upload.id} upload={upload} nested onRetry={retry} onDismiss={dismiss} onOpen={onOpen} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles.region} ${position}`}
      aria-label={t("uploads.region")}
      data-stacked={uploads.length > 1 ? "true" : "false"}
    >
      {uploads.length > 1 ? (
        <>
          <span className={styles.layerBack} aria-hidden="true" />
          <span className={styles.layerMid} aria-hidden="true" />
        </>
      ) : null}
      <UploadAlert
        upload={top}
        nested={false}
        onRetry={retry}
        onDismiss={dismiss}
        onOpen={onOpen}
        extra={
          uploads.length > 1 ? (
            <button
              type="button"
              className={styles.count}
              aria-label={t("uploads.expand", { count: uploads.length })}
              onClick={() => setExpanded(true)}
            >
              {uploads.length}
              <UpIcon size={14} strokeWidth={2.6} />
            </button>
          ) : null
        }
      />
    </section>
  );
}
