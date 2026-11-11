import type { VideoPlatform } from "../../../domain/domain.types";

/** Where a video link that is being saved has got to. */
export type UploadStatus = "reading" | "failed" | "ready";

/** One pasted link, read in the background while the person keeps using the app. */
export type Upload = {
  id: string;
  url: string;
  platform: VideoPlatform | null;
  status: UploadStatus;
  recipeId: string | null;
  title: string | null;
  errorCode: string | null;
};

/** What the screens can do with background uploads. */
export type UploadControls = {
  uploads: Upload[];
  start: (url: string) => void;
  retry: (uploadId: string) => void;
  dismiss: (uploadId: string) => void;
};
