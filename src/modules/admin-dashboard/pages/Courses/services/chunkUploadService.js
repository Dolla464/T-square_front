import {
  uploadChunk,
  finalizeChunkedUpload,
} from "../../../services/coursesServices";

/** Sync with backend config/upload.php → chunk_size_bytes */
export const CHUNK_SIZE = 5 * 1024 * 1024;

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 30000;
const CONCURRENCY = 2;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (err) => {
  if (!err?.response) return true;
  const status = err.response.status;
  return status >= 500 || status === 408 || status === 429;
};

const computeBackoffDelay = (attempt) => {
  const base = Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS);
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
};

/**
 * Compute SHA-256 of a File incrementally inside a Web Worker (hash-wasm).
 */
export const computeFileSha256 = (file, { onProgress, signal } = {}) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/sha256Worker.js", import.meta.url),
      { type: "module" },
    );

    const cleanup = () => {
      worker.terminate();
    };

    if (signal) {
      if (signal.aborted) {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      });
    }

    worker.onmessage = (event) => {
      const { type } = event.data;

      if (type === "ready") {
        const sendChunks = async () => {
          let offset = 0;
          while (offset < file.size) {
            if (signal?.aborted) return;
            const end = Math.min(offset + CHUNK_SIZE, file.size);
            const slice = file.slice(offset, end);
            offset = end;
            const buffer = await slice.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            worker.postMessage({ type: "chunk", buffer: bytes }, [bytes.buffer]);
          }
          worker.postMessage({ type: "finish" });
        };
        sendChunks();
      } else if (type === "progress") {
        onProgress?.(event.data.percent);
      } else if (type === "done") {
        cleanup();
        resolve(event.data.sha256);
      }
    };

    worker.onerror = (err) => {
      cleanup();
      reject(err);
    };

    worker.postMessage({ type: "start", totalBytes: file.size });
  });

/**
 * Upload a video file via chunked upload + finalize.
 */
export const uploadVideo = async ({
  file,
  courseId,
  uploadId,
  previewIndex = null,
  durationSeconds = null,
  signal = null,
  onProgress,
  onChunkComplete,
  onRetry,
  onHashProgress,
}) => {
  if (!file || !courseId || !uploadId) {
    throw new Error("file, courseId, and uploadId are required");
  }

  const sha256 = await computeFileSha256(file, {
    onProgress: onHashProgress,
    signal,
  });

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const chunkSizes = Array.from({ length: totalChunks }, (_, i) => {
    const start = i * CHUNK_SIZE;
    return Math.min(CHUNK_SIZE, file.size - start);
  });

  const chunkLoadedBytes = new Array(totalChunks).fill(0);
  const completedChunks = new Array(totalChunks).fill(false);

  const updateProgress = () => {
    const loaded = chunkLoadedBytes.reduce((sum, n) => sum + n, 0);
    const pct =
      file.size > 0 ? Math.min(Math.round((loaded / file.size) * 100), 99) : 0;
    onProgress?.({
      bytesUploaded: loaded,
      bytesTotal: file.size,
      percent: pct,
      totalChunks,
      completedCount: completedChunks.filter(Boolean).length,
    });
  };

  const uploadOne = async (index) => {
    const start = index * CHUNK_SIZE;
    const chunk = file.slice(start, start + CHUNK_SIZE);

    const fd = new FormData();
    fd.append("chunk", chunk);
    fd.append("chunk_index", String(index));
    fd.append("total_chunks", String(totalChunks));
    fd.append("upload_id", uploadId);
    fd.append("original_filename", file.name);
    fd.append("expected_filesize", String(file.size));
    fd.append("sha256", sha256);
    fd.append("chunk_size", String(CHUNK_SIZE));
    if (previewIndex != null) {
      fd.append("preview_index", String(previewIndex));
    }

    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (signal?.aborted) {
        throw Object.assign(new Error("Upload cancelled"), { cancelled: true });
      }

      try {
        await uploadChunk(courseId, fd, signal, (event) => {
          if (!event.total) return;
          chunkLoadedBytes[index] = event.loaded;
          updateProgress();
        });
        completedChunks[index] = true;
        chunkLoadedBytes[index] = chunkSizes[index];
        updateProgress();
        onChunkComplete?.({ chunkIndex: index, totalChunks });
        return;
      } catch (err) {
        if (signal?.aborted || err?.cancelled || err?.name === "AbortError") {
          throw Object.assign(new Error("Upload cancelled"), { cancelled: true });
        }
        lastError = err;
        if (!isRetryableError(err) || attempt >= MAX_RETRIES - 1) {
          throw err;
        }
        const delayMs = computeBackoffDelay(attempt);
        onRetry?.({ chunkIndex: index, attempt: attempt + 1, delayMs });
        await sleep(delayMs);
      }
    }

    throw lastError;
  };

  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      if (signal?.aborted) {
        throw Object.assign(new Error("Upload cancelled"), { cancelled: true });
      }
      const i = nextIndex++;
      if (i >= totalChunks) break;
      await uploadOne(i);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, totalChunks) }, worker),
  );

  if (signal?.aborted) {
    throw Object.assign(new Error("Upload cancelled"), { cancelled: true });
  }

  onProgress?.({
    bytesUploaded: file.size,
    bytesTotal: file.size,
    percent: 100,
    totalChunks,
    completedCount: totalChunks,
  });

  const finalizePayload = { upload_id: uploadId };
  if (durationSeconds != null && durationSeconds > 0) {
    finalizePayload.duration_seconds = durationSeconds;
  }

  return finalizeChunkedUpload(courseId, finalizePayload, signal);
};
