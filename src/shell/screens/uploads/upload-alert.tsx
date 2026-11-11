import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertIcon, CheckIcon, CloseIcon, SpinnerIcon } from "../shell/icons";
import type { Upload } from "./uploads.types";
import styles from "./upload-alerts.module.css";

/** One link being read: a spinner, a failure with Try again, or Ready with Open. */
export function UploadAlert({
  upload,
  nested,
  extra,
  onRetry,
  onDismiss,
  onOpen,
}: {
  upload: Upload;
  nested: boolean;
  extra?: ReactNode;
  onRetry: (uploadId: string) => void;
  onDismiss: (uploadId: string) => void;
  onOpen: (recipeId: string) => void;
}) {
  const { t } = useTranslation();
  const platform = upload.platform ? t(`platforms.${upload.platform}`) : t("add.link");
  const text = alertText({ upload, platform, translate: t });
  const canRetry = upload.status === "failed" && upload.errorCode !== "bad_link";

  return (
    <div className={nested ? styles.item : styles.toast} role="status">
      <span className={styles.icon} data-status={upload.status}>
        {upload.status === "reading" ? (
          <span className={styles.spin}>
            <SpinnerIcon size={18} strokeWidth={2.6} />
          </span>
        ) : upload.status === "failed" ? (
          <AlertIcon size={18} strokeWidth={2.6} />
        ) : (
          <CheckIcon size={18} strokeWidth={2.6} />
        )}
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{text.title}</span>
        <span className={styles.sub}>{text.sub}</span>
      </span>
      {canRetry ? (
        <button type="button" className={styles.retry} onClick={() => onRetry(upload.id)}>
          {t("uploads.retry")}
        </button>
      ) : null}
      {upload.status === "ready" && upload.recipeId ? (
        <button
          type="button"
          className={styles.open}
          onClick={() => {
            onOpen(upload.recipeId ?? "");
            onDismiss(upload.id);
          }}
        >
          {t("uploads.open")}
        </button>
      ) : null}
      {extra}
      <button
        type="button"
        className={styles.dismiss}
        aria-label={t("uploads.dismiss")}
        onClick={() => onDismiss(upload.id)}
      >
        <CloseIcon size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}

function alertText({
  upload,
  platform,
  translate,
}: {
  upload: Upload;
  platform: string;
  translate: (key: string, options?: Record<string, unknown>) => string;
}): { title: string; sub: string } {
  if (upload.status === "reading") {
    return { title: translate("uploads.reading", { platform }), sub: translate("uploads.readingSub") };
  }

  if (upload.status === "ready") {
    return {
      title: translate("uploads.ready", { title: upload.title ?? platform }),
      sub: translate("uploads.readySub", { platform }),
    };
  }

  return { title: translate("uploads.failed", { platform }), sub: translate(failureKey(upload.errorCode)) };
}

function failureKey(code: string | null): string {
  if (code === "bad_link") {
    return "uploads.badLink";
  }

  if (code === "retry_in_progress") {
    return "recipe.retryInProgress";
  }

  if (code === "retry_rate_limited") {
    return "recipe.retryRateLimited";
  }

  if (code === "retry_limit_daily") {
    return "recipe.retryLimitDaily";
  }

  return "uploads.failedSub";
}
