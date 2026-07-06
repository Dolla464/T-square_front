import { useState, useRef } from "react";
import { uploadChunk, finalizeChunkedUpload } from "../../../services/coursesServices";

const DEFAULT_CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB — lighter per request on slow networks
const MAX_RETRIES = 3;
const CONCURRENCY = 2; // fewer parallel uploads = less connection pressure

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
   * Begin uploading `file` in chunks using a parallel concurrency pool.
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

    // Track uploaded bytes per chunk for smooth progress (onUploadProgress + completion)
    const chunkLoadedBytes = new Array(totalChunks).fill(0);
    const chunkSizes = Array.from({ length: totalChunks }, (_, i) => {
      const start = i * chunkSize;
      return Math.min(chunkSize, file.size - start);
    });
    const completedChunks = new Array(totalChunks).fill(false);

    const updateProgress = () => {
      const loaded = chunkLoadedBytes.reduce((sum, n) => sum + n, 0);
      const pct = file.size > 0
        ? Math.min(Math.round((loaded / file.size) * 100), 99)
        : 0;
      patch(lessonKey, { progress: pct, status: "uploading" });
    };

    /**
     * Upload a single chunk with retry logic.
     * @param {number} i  chunk index
     */
    const uploadOne = async (i) => {
      const start = i * chunkSize;
      const chunk = file.slice(start, start + chunkSize);

      const fd = new FormData();
      fd.append("chunk", chunk);
      fd.append("chunk_index", String(i));
      fd.append("total_chunks", String(totalChunks));
      fd.append("filename", file.name);
      fd.append("preview_index", String(previewIndex));

      let lastError;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (controller.signal.aborted) {
          throw Object.assign(new Error("Upload cancelled"), { cancelled: true });
        }
        try {
          await uploadChunk(courseId, fd, controller.signal, (event) => {
            if (!event.total) return;
            chunkLoadedBytes[i] = event.loaded;
            updateProgress();
          });
          completedChunks[i] = true;
          chunkLoadedBytes[i] = chunkSizes[i];
          updateProgress();
          return;
        } catch (err) {
          if (controller.signal.aborted || err?.cancelled) {
            throw Object.assign(new Error("Upload cancelled"), { cancelled: true });
          }
          lastError = err;
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }

      throw lastError;
    };

    try {
      // ── Concurrency pool ─────────────────────────────────────────────────────
      // Workers share a shared `nextIndex` counter so we don't need complex
      // bookkeeping: each worker picks the next unchosen index until all are done.
      let nextIndex = 0;

      const worker = async () => {
        while (true) {
          if (controller.signal.aborted) {
            throw Object.assign(new Error("Upload cancelled"), { cancelled: true });
          }
          const i = nextIndex++;
          if (i >= totalChunks) break;
          await uploadOne(i);
        }
      };

      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, totalChunks) }, worker));

      // ── All chunks received by the server – ask it to assemble ──────────────
      if (controller.signal.aborted) {
        throw Object.assign(new Error("Upload cancelled"), { cancelled: true });
      }

      const serverResponse = await finalizeChunkedUpload(
        courseId,
        { filename: file.name, total_chunks: totalChunks, preview_index: previewIndex },
        controller.signal,
      );

      patch(lessonKey, { progress: 100, status: "complete", error: null });
      onComplete?.(serverResponse);
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
