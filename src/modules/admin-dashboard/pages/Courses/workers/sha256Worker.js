import { createSHA256 } from "hash-wasm";

/** Must match config/upload.php chunk_size_bytes on the backend. */
const SLICE_SIZE = 5 * 1024 * 1024;

let hasher = null;
let processedBytes = 0;
let totalBytes = 0;

self.onmessage = async (event) => {
  const { type } = event.data;

  if (type === "start") {
    hasher = await createSHA256();
    hasher.init();
    processedBytes = 0;
    totalBytes = event.data.totalBytes ?? 0;
    self.postMessage({ type: "ready" });
    return;
  }

  if (type === "chunk") {
    if (!hasher) return;
    const raw = event.data.buffer;
    const bytes =
      raw instanceof Uint8Array
        ? raw
        : new Uint8Array(raw instanceof ArrayBuffer ? raw : raw.buffer);
    hasher.update(bytes);
    processedBytes += bytes.byteLength;
    const percent =
      totalBytes > 0 ? Math.min(Math.round((processedBytes / totalBytes) * 100), 99) : 0;
    self.postMessage({ type: "progress", percent, processedBytes, totalBytes });
    return;
  }

  if (type === "finish") {
    if (!hasher) return;
    const sha256 = hasher.digest("hex");
    hasher = null;
    self.postMessage({ type: "done", sha256 });
  }
};

export { SLICE_SIZE };
