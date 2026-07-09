import BasePlugin from "@uppy/core/lib/BasePlugin.js";
import { uploadVideo } from "../services/chunkUploadService";

/**
 * Thin Uppy plugin — delegates all chunking logic to chunkUploadService.
 */
export default class UppyLaravelChunkUpload extends BasePlugin {
  constructor(uppy, opts = {}) {
    super(uppy, opts);
    this.id = "LaravelChunkUpload";
    this.type = "uploader";
  }

  install() {
    this.uppy.addUploader(this.uploadFiles.bind(this));
  }

  uninstall() {
    this.uppy.removeUploader(this.uploadFiles.bind(this));
  }

  async uploadFiles(fileIDs) {
    await Promise.all(
      fileIDs.map(async (fileID) => {
        const file = this.uppy.getFile(fileID);
        const meta = file.meta ?? {};

        try {
          this.uppy.emit("upload-started", file);

          const response = await uploadVideo({
            file: file.data,
            courseId: meta.courseId,
            uploadId: meta.uploadId,
            previewIndex: meta.previewIndex ?? null,
            durationSeconds: meta.durationSeconds ?? null,
            signal: meta.abortController?.signal,
            onHashProgress: (percent) => {
              this.uppy.setFileState(fileID, {
                progress: { uploadStarted: Date.now(), percentage: Math.round(percent * 0.1) },
              });
              this.uppy.emit("upload-progress", file, {
                uploadStarted: Date.now(),
                bytesUploaded: Math.round((file.data.size * percent) / 100),
                bytesTotal: file.data.size,
                percentage: Math.round(percent * 0.1),
              });
            },
            onProgress: ({ bytesUploaded, bytesTotal, percent, completedCount, totalChunks }) => {
              const hashPhaseDone = 10;
              const uploadPercent = hashPhaseDone + Math.round(percent * 0.9);
              this.uppy.setFileState(fileID, {
                progress: {
                  uploadStarted: file.progress?.uploadStarted ?? Date.now(),
                  bytesUploaded,
                  bytesTotal,
                  percentage: uploadPercent,
                },
                meta: {
                  ...meta,
                  chunkProgress: `${completedCount}/${totalChunks}`,
                },
              });
              this.uppy.emit("upload-progress", file, {
                uploadStarted: file.progress?.uploadStarted ?? Date.now(),
                bytesUploaded,
                bytesTotal,
                percentage: uploadPercent,
              });
            },
            onRetry: ({ chunkIndex, attempt, delayMs }) => {
              this.uppy.info(
                `Retrying chunk ${chunkIndex + 1} (attempt ${attempt})…`,
                "warning",
                3000,
              );
              meta.onRetry?.({ chunkIndex, attempt, delayMs });
            },
          });

          this.uppy.emit("upload-success", file, { body: response });
          this.uppy.setFileState(fileID, {
            progress: { uploadComplete: true, percentage: 100 },
            uploadURL: response?.video_url,
            response,
          });
        } catch (err) {
          const errorMessage =
            err?.response?.data?.message ??
            err?.response?.data?.error ??
            err?.message ??
            "Upload failed";

          const error = new Error(errorMessage);
          this.uppy.emit("upload-error", file, error);
          throw error;
        }
      }),
    );
  }
}
