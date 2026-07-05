import { useState, useRef } from "react";
import { uploadChunk } from "../../../services/coursesServices";

const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_RETRIES = 3;

/**
 * Manages concurrent chunked video uploads.
 *
 * Each upload is keyed by a `lessonKey` string so multiple lessons can
 * upload simultaneously without interfering with each other.
 *
 * Returned shape:
 *   uploads        – { [lessonKey]: { progress: 0-100, status, error } }
 *   startUpload    – (lessonKey, file, courseId, previewIndex, callbacks?) => Promise<void>
 *   cancelUpload   – (lessonKey) => void
 *   clearUpload    – (lessonKey) => void
 */
export const useChunkedUpload = ({ chunkSize = DEFAULT_CHUNK_SIZE } = {}) => {
  const [uploads, setUploads] = useState({});
  const controllersRef = useRef({}); // { [lessonKey]: AbortController }

  const patch = (lessonKey, updates) =>
    setUploads((prev) => ({
      ...prev,
      [lessonKey]: { ...(prev[lessonKey] ?? {}), ...updates },
    }));

  /**
   * Begin uploading `file` in chunks.
   *
   * @param {string}   lessonKey    Unique identifier for this lesson (used as Map key)
   * @param {File}     file         The video File selected by the user
   * @param {number}   courseId     Existing course ID (required – the server route needs it)
   * @param {number}   previewIndex Zero-based index of this preview/lesson in the list
   * @param {object}   [callbacks]
   * @param {Function} [callbacks.onComplete]  Called with the server response on success
   * @param {Function} [callbacks.onError]     Called with the Error on failure
   */
  const startUpload = async (
    lessonKey,
    file,
    courseId,
    previewIndex,
    { onComplete, onError } = {},
  ) => {
    if (!file || !courseId) return;

    // Cancel any running upload for the same lesson
    cancelUpload(lessonKey);

    const controller = new AbortController();
    controllersRef.current[lessonKey] = controller;

    patch(lessonKey, { progress: 0, status: "uploading", error: null });

    const totalChunks = Math.ceil(file.size / chunkSize);

    try {
      for (let i = 0; i < totalChunks; i++) {
        if (controller.signal.aborted) {
          throw Object.assign(new Error("Upload cancelled"), { cancelled: true });
        }

        const start = i * chunkSize;
        const chunk = file.slice(start, start + chunkSize);

        const fd = new FormData();
        fd.append("chunk", chunk);
        fd.append("chunk_index", String(i));
        fd.append("total_chunks", String(totalChunks));
        fd.append("filename", file.name);
        fd.append("preview_index", String(previewIndex));

        // Track real transfer progress within this chunk
        const handleChunkProgress = (progressEvent) => {
          if (!progressEvent.total) return;
          const chunkFraction = progressEvent.loaded / progressEvent.total;
          const rawProgress = ((i + chunkFraction) / totalChunks) * 100;
          // Cap at 99 on the last chunk — server assembly happens after transfer
          const progress =
            i === totalChunks - 1
              ? Math.min(Math.round(rawProgress), 99)
              : Math.round(rawProgress);
          patch(lessonKey, { progress, status: "uploading" });
        };

        // Retry each individual chunk up to MAX_RETRIES times
        let lastError;
        let chunkResponse;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            chunkResponse = await uploadChunk(
              courseId,
              fd,
              controller.signal,
              handleChunkProgress,
            );
            lastError = null;
            break;
          } catch (err) {
            if (controller.signal.aborted || err?.cancelled) {
              throw Object.assign(new Error("Upload cancelled"), {
                cancelled: true,
              });
            }
            lastError = err;
            if (attempt < MAX_RETRIES - 1) {
              await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            }
          }
        }

        if (lastError) throw lastError;

        // Final chunk → server returns { status: 'complete', video_url, … }
        if (i === totalChunks - 1) {
          patch(lessonKey, { progress: 100, status: "complete", error: null });
          onComplete?.(chunkResponse);
          return;
        }

        const progress = Math.round(((i + 1) / totalChunks) * 100);
        patch(lessonKey, { progress, status: "uploading" });
      }
    } catch (err) {
      if (err?.cancelled || controller.signal.aborted) {
        patch(lessonKey, { progress: 0, status: "cancelled", error: null });
      } else {
        const message = err?.response?.data?.message ?? err?.message ?? "Upload failed";
        patch(lessonKey, { progress: 0, status: "error", error: message });
        onError?.(err);
      }
    } finally {
      delete controllersRef.current[lessonKey];
    }
  };

  /** Abort an in-progress upload and reset its state. */
  const cancelUpload = (lessonKey) => {
    const ctrl = controllersRef.current[lessonKey];
    if (ctrl) {
      ctrl.abort();
      delete controllersRef.current[lessonKey];
    }
    patch(lessonKey, { progress: 0, status: "cancelled", error: null });
  };

  /** Remove all tracked state for a lesson (e.g. after the lesson row is deleted). */
  const clearUpload = (lessonKey) => {
    const ctrl = controllersRef.current[lessonKey];
    if (ctrl) ctrl.abort();
    delete controllersRef.current[lessonKey];

    setUploads((prev) => {
      const next = { ...prev };
      delete next[lessonKey];
      return next;
    });
  };

  return { uploads, startUpload, cancelUpload, clearUpload };
};
