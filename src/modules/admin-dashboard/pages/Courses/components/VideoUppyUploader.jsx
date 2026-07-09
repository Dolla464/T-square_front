import { useEffect, useMemo, useRef, useState } from "react";
import Uppy from "@uppy/core";
import StatusBar from "@uppy/react/lib/StatusBar.js";
import "@uppy/core/dist/style.min.css";
import "@uppy/status-bar/dist/style.min.css";
import UppyLaravelChunkUpload from "../plugins/uppyLaravelChunkUpload";
import "./VideoUppyUploader.css";

const MAX_VIDEO_SIZE = 512000 * 1024;
const ACCEPTED_VIDEO = "video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv";

function VideoUppyUploader({
  lessonKey,
  courseId,
  previewIndex,
  formData,
  isReadOnly,
  isArabic,
  ensureCourseDraft,
  onDraftCreated,
  getAbortController,
  onUploadStateChange,
  onFileReady,
  onUploadComplete,
  onUploadError,
}) {
  const processingRef = useRef(false);
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef(null);
  const ctxRef = useRef({});

  ctxRef.current = {
    courseId,
    previewIndex,
    formData,
    isArabic,
    lessonKey,
    ensureCourseDraft,
    onDraftCreated,
    getAbortController,
    onUploadStateChange,
    onFileReady,
    onUploadComplete,
    onUploadError,
  };

  const uppy = useMemo(() => {
    const instance = new Uppy({
      id: `uppy-${lessonKey}`,
      autoProceed: false,
      allowMultipleUploadBatches: false,
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: MAX_VIDEO_SIZE,
        allowedFileTypes: ["video/*", ".mp4", ".webm", ".mov", ".avi", ".mkv"],
      },
    });

    instance.use(UppyLaravelChunkUpload);

    return instance;
  }, [lessonKey]);

  useEffect(() => {
    const formatDuration = (totalSeconds) => {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${m}:${String(s).padStart(2, "0")}`;
    };

    const processFile = async (file) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setIsBusy(true);

      const ctx = ctxRef.current;

      try {
        ctx.onUploadStateChange?.({
          isUploading: true,
          progress: 0,
          status: "hashing",
          error: null,
          retryMessage: null,
        });

        const uploadId = crypto.randomUUID();
        const blobUrl = URL.createObjectURL(file.data);

        let durationSeconds = null;
        try {
          durationSeconds = await new Promise((resolve, reject) => {
            const videoEl = document.createElement("video");
            videoEl.preload = "metadata";
            videoEl.onloadedmetadata = () => {
              resolve(Math.floor(videoEl.duration));
            };
            videoEl.onerror = () => reject(new Error("metadata"));
            videoEl.src = blobUrl;
          });
        } catch {
          durationSeconds = null;
        }

        ctx.onFileReady?.({
          blobUrl,
          durationSeconds,
          durationFormatted:
            durationSeconds != null ? formatDuration(durationSeconds) : null,
        });

        let resolvedCourseId = ctx.courseId;

        if (!resolvedCourseId) {
          const draft = await ctx.ensureCourseDraft(ctx.formData, null, ctx.isArabic);
          resolvedCourseId = draft?.id ?? draft;
          ctx.onDraftCreated?.(draft);
        }

        const abortController = ctx.getAbortController(ctx.lessonKey);

        uppy.setFileMeta(file.id, {
          courseId: resolvedCourseId,
          uploadId,
          previewIndex: ctx.previewIndex,
          durationSeconds,
          abortController,
          onRetry: ({ chunkIndex, attempt }) => {
            ctx.onUploadStateChange?.({
              isUploading: true,
              status: "uploading",
              retryMessage: ctx.isArabic
                ? `إعادة المحاولة ${attempt}/3 للجزء ${chunkIndex + 1}`
                : `Retry ${attempt}/3 for chunk ${chunkIndex + 1}`,
            });
          },
        });

        await uppy.upload();
      } catch (err) {
        const uppyFile = uppy.getFiles()[0];
        if (uppyFile) {
          uppy.removeFile(uppyFile.id);
        }
        ctx.onUploadError?.(err?.message ?? "Upload failed");
        ctx.onUploadStateChange?.({
          isUploading: false,
          progress: 0,
          status: "error",
          error: err?.message,
        });
      } finally {
        processingRef.current = false;
        setIsBusy(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    const handleFileAdded = async (file) => {
      await processFile(file);
    };

    const handleProgress = (file, progress) => {
      ctxRef.current.onUploadStateChange?.({
        isUploading: true,
        progress: progress?.percentage ?? 0,
        status: "uploading",
        error: null,
        chunkProgress: file.meta?.chunkProgress,
      });
    };

    const handleSuccess = (_file, response) => {
      const body = response?.body ?? response;
      ctxRef.current.onUploadComplete?.(body);
      ctxRef.current.onUploadStateChange?.({
        isUploading: false,
        progress: 100,
        status: "complete",
        error: null,
      });
    };

    const handleError = (_file, error) => {
      ctxRef.current.onUploadError?.(error?.message ?? "Upload failed");
      ctxRef.current.onUploadStateChange?.({
        isUploading: false,
        progress: 0,
        status: "error",
        error: error?.message,
      });
    };

    const handleRestrictionFailed = (_file, error) => {
      ctxRef.current.onUploadError?.(error?.message);
    };

    uppy.on("file-added", handleFileAdded);
    uppy.on("upload-progress", handleProgress);
    uppy.on("upload-success", handleSuccess);
    uppy.on("upload-error", handleError);
    uppy.on("restriction-failed", handleRestrictionFailed);

    return () => {
      uppy.off("file-added", handleFileAdded);
      uppy.off("upload-progress", handleProgress);
      uppy.off("upload-success", handleSuccess);
      uppy.off("upload-error", handleError);
      uppy.off("restriction-failed", handleRestrictionFailed);
    };
  }, [uppy]);

  useEffect(() => {
    return () => {
      uppy.cancelAll();
      uppy.destroy();
    };
  }, [uppy]);

  const handleInputChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    try {
      uppy.clear();
      uppy.addFile({
        source: "VideoInput",
        name: selected.name,
        type: selected.type,
        data: selected,
      });
    } catch (err) {
      onUploadError?.(err?.message ?? "Could not add file");
    }
  };

  const openFilePicker = () => {
    if (processingRef.current || isBusy) return;
    fileInputRef.current?.click();
  };

  if (isReadOnly) return null;

  return (
    <div className="video-uppy-uploader w-100 h-100 position-relative d-flex flex-column">
      <button
        type="button"
        className="video-upload-trigger flex-grow-1"
        onClick={openFilePicker}
        disabled={isBusy}
      >
        <i className="bi bi-cloud-arrow-up-fill video-upload-icon" aria-hidden="true" />
        <span className="video-upload-title">
          {isArabic ? "اضغط لرفع فيديو" : "Click to upload video"}
        </span>
        <span className="video-upload-hint">
          {isArabic ? "MP4, WebM, MOV — حتى 500MB" : "MP4, WebM, MOV — up to 500MB"}
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_VIDEO}
        className="d-none"
        onChange={handleInputChange}
      />

      <StatusBar
        uppy={uppy}
        hideUploadButton
        showProgressDetails
        hideAfterFinish={false}
      />
    </div>
  );
}

export default VideoUppyUploader;
