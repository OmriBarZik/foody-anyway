import { useCallback, useEffect, useRef, useState } from "react";
import type { RecipeView } from "../../../domain/domain.types";
import { detectPlatform } from "../../../library/detect-platform";
import { ApiError, retryRecipe, saveRecipe } from "../../api";
import type { Upload, UploadControls } from "./uploads.types";

const READY_SECONDS = 12;

/**
 * Save pasted links without making anyone wait. Each link becomes an alert that reads,
 * then turns ready or failed. A failed one can be tried again from the alert.
 */
export function useUploads({ onSaved }: { onSaved: () => void }): UploadControls {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const timers = useRef(new Map<string, number>());

  useEffect(() => {
    const pending = timers.current;

    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const patch = useCallback((uploadId: string, change: Partial<Upload>) => {
    setUploads((current) => current.map((upload) => (upload.id === uploadId ? { ...upload, ...change } : upload)));
  }, []);

  const dismiss = useCallback((uploadId: string) => {
    window.clearTimeout(timers.current.get(uploadId));
    timers.current.delete(uploadId);
    setUploads((current) => current.filter((upload) => upload.id !== uploadId));
  }, []);

  const settle = useCallback(
    async ({ uploadId, request }: { uploadId: string; request: Promise<RecipeView> }) => {
      try {
        const recipe = await request;
        const failed = recipe.extractionStatus === "failed";
        patch(uploadId, {
          status: failed ? "failed" : "ready",
          recipeId: recipe.id,
          title: recipe.title,
          errorCode: failed ? "read_failed" : null,
        });

        if (!failed) {
          timers.current.set(
            uploadId,
            window.setTimeout(() => dismiss(uploadId), READY_SECONDS * 1000),
          );
        }
      } catch (error) {
        patch(uploadId, { status: "failed", errorCode: error instanceof ApiError ? error.code : "save_failed" });
      }

      onSaved();
    },
    [dismiss, onSaved, patch],
  );

  const start = useCallback(
    (url: string) => {
      const upload: Upload = {
        id: crypto.randomUUID(),
        url,
        platform: detectPlatform(url)?.platform ?? null,
        status: "reading",
        recipeId: null,
        title: null,
        errorCode: null,
      };
      setUploads((current) => [upload, ...current]);
      // The server keeps the link as soon as the read starts, so the list shows it right away.
      window.setTimeout(onSaved, 1500);
      void settle({ uploadId: upload.id, request: saveRecipe(url) });
    },
    [onSaved, settle],
  );

  const retry = useCallback(
    (uploadId: string) => {
      const upload = uploads.find((entry) => entry.id === uploadId);

      if (!upload) {
        return;
      }

      patch(uploadId, { status: "reading", errorCode: null });
      const request = upload.recipeId ? retryRecipe(upload.recipeId) : saveRecipe(upload.url);
      void settle({ uploadId, request });
    },
    [patch, settle, uploads],
  );

  return { uploads, start, retry, dismiss };
}
