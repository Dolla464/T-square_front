import { useState, useRef, useEffect } from "react";
import {
  defaultFormData,
  createLesson,
  createSection,
} from "../utils/courseHelpers";
import { useChunkedUpload } from "./useChunkedUpload";

/**
 * Encapsulates all form state and mutation handlers for the Course form.
 * Pass the returned values down via props to CourseForm and its tab children.
 */
export const useCourseFormLogic = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const { uploads: chunkUploads, startUpload, cancelUpload, clearUpload } =
    useChunkedUpload();

  // Track active blob URLs by lessonId so we can revoke them at the right time
  const blobUrlsRef = useRef({});

  useEffect(() => {
    const urlsRef = blobUrlsRef;
    return () => {
      Object.values(urlsRef.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  // ─── Generic field handler ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ─── Learnings ─────────────────────────────────────────────────────────────
  const handleLearningChange = (index, value) => {
    setFormData((prev) => {
      const newLearnings = [...prev.learnings];
      newLearnings[index] = value;
      return { ...prev, learnings: newLearnings };
    });
  };

  const addLearning = () =>
    setFormData((prev) => ({ ...prev, learnings: [...prev.learnings, ""] }));

  const removeLearning = (index) =>
    setFormData((prev) => ({
      ...prev,
      learnings: prev.learnings.filter((_, i) => i !== index),
    }));

  // ─── Image file selection ──────────────────────────────────────────────────
  const handleFileChange = (e, type = "thumbnail") => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(selectedFile.type)) {
      alert("Invalid file type. Please use PNG, JPEG or WEBP.");
      return;
    }
    if (type === "thumbnail") setThumbnailFile(selectedFile);
    else setCoverFile(selectedFile);
  };

  // ─── Curriculum helpers ────────────────────────────────────────────────────
  const updateCurriculum = (updater) =>
    setFormData((prev) => ({
      ...prev,
      curriculum: updater(prev.curriculum),
    }));

  const handleSectionTitleChange = (sectionId, title) =>
    updateCurriculum((curriculum) =>
      curriculum.map((section) =>
        section.id === sectionId ? { ...section, title } : section,
      ),
    );

  const handleLessonChange = (sectionId, lessonId, field, value) =>
    updateCurriculum((curriculum) =>
      curriculum.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          lessons: section.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, [field]: value } : lesson,
          ),
        };
      }),
    );

  /**
   * Format raw seconds into a human-readable string (M:SS or H:MM:SS).
   */
  const formatDuration = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  };

  /**
   * Handle video file selection.
   *
   * When `courseId` is provided (edit mode) the file is uploaded immediately
   * in chunks. Progress and the final server-returned video_url are stored on
   * the lesson.
   *
   * When `courseId` is null (create mode) the raw File is kept in `videoFile`
   * and sent as a multipart attachment during form submission (legacy behaviour).
   *
   * @param {string}      sectionId
   * @param {string}      lessonId
   * @param {File}        uploadedFile
   * @param {number|null} courseId      Pass editingItem.id from the parent component
   * @param {number}      previewIndex  Zero-based index of this lesson in the flat list
   */
  const handleVideoUpload = (
    sectionId,
    lessonId,
    uploadedFile,
    courseId = null,
    previewIndex = 0,
  ) => {
    if (!uploadedFile) return;

    // Always set the display name immediately
    handleLessonChange(sectionId, lessonId, "video", uploadedFile.name);
    // Clear any previous server-side URL so the submission logic uses the new upload
    handleLessonChange(sectionId, lessonId, "uploadedVideoUrl", null);

    // Revoke any existing blob URL for this lesson before creating a new one
    if (blobUrlsRef.current[lessonId]) {
      URL.revokeObjectURL(blobUrlsRef.current[lessonId]);
    }

    // Create the blob URL once and keep it alive for the preview
    const blobUrl = URL.createObjectURL(uploadedFile);
    blobUrlsRef.current[lessonId] = blobUrl;
    handleLessonChange(sectionId, lessonId, "blobUrl", blobUrl);

    // Extract duration via HTML5 Video API (works before upload completes)
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.onloadedmetadata = () => {
      // Do NOT revoke here – the same blob URL is still needed for video preview
      const totalSeconds = Math.floor(videoEl.duration);
      handleLessonChange(sectionId, lessonId, "duration", totalSeconds);
      handleLessonChange(
        sectionId,
        lessonId,
        "durationFormatted",
        formatDuration(totalSeconds),
      );
    };
    videoEl.onerror = () => console.error("Failed to load video metadata");
    videoEl.src = blobUrl;

    if (courseId) {
      // ── Chunked upload path (edit mode) ────────────────────────────────────
      // Mark the lesson as uploading so the UI can show a progress bar
      handleLessonChange(sectionId, lessonId, "isUploading", true);
      handleLessonChange(sectionId, lessonId, "uploadError", null);

      startUpload(lessonId, uploadedFile, courseId, previewIndex, {
        onComplete: (serverResponse) => {
          // Blob URL is no longer needed – the server URL takes over
          if (blobUrlsRef.current[lessonId]) {
            URL.revokeObjectURL(blobUrlsRef.current[lessonId]);
            delete blobUrlsRef.current[lessonId];
          }
          handleLessonChange(sectionId, lessonId, "blobUrl", null);

          // Store the server-returned path and duration on the lesson
          handleLessonChange(
            sectionId,
            lessonId,
            "uploadedVideoUrl",
            serverResponse.video_url,
          );
          // Use server duration when getID3 extracted it; otherwise keep the
          // browser-extracted value that was set above via onloadedmetadata
          if (serverResponse.duration_seconds != null) {
            handleLessonChange(
              sectionId,
              lessonId,
              "duration",
              serverResponse.duration_seconds,
            );
            handleLessonChange(
              sectionId,
              lessonId,
              "durationFormatted",
              formatDuration(serverResponse.duration_seconds),
            );
          }
          handleLessonChange(sectionId, lessonId, "isUploading", false);
          handleLessonChange(sectionId, lessonId, "videoFile", null);
        },
        onError: (err) => {
          handleLessonChange(sectionId, lessonId, "isUploading", false);
          handleLessonChange(
            sectionId,
            lessonId,
            "uploadError",
            err?.message ?? "Upload failed",
          );
        },
      });
    } else {
      // ── Legacy path (create mode – no course ID yet) ────────────────────────
      // The file will be sent as multipart during form submission
      handleLessonChange(sectionId, lessonId, "videoFile", uploadedFile);
      handleLessonChange(sectionId, lessonId, "isUploading", false);
    }
  };

  /**
   * Cancel an in-progress chunked upload and reset the lesson's video state.
   */
  const handleCancelUpload = (sectionId, lessonId) => {
    cancelUpload(lessonId);
    if (blobUrlsRef.current[lessonId]) {
      URL.revokeObjectURL(blobUrlsRef.current[lessonId]);
      delete blobUrlsRef.current[lessonId];
    }
    handleLessonChange(sectionId, lessonId, "isUploading", false);
    handleLessonChange(sectionId, lessonId, "video", "");
    handleLessonChange(sectionId, lessonId, "blobUrl", null);
    handleLessonChange(sectionId, lessonId, "videoFile", null);
    handleLessonChange(sectionId, lessonId, "uploadedVideoUrl", null);
    handleLessonChange(sectionId, lessonId, "uploadError", null);
  };

  const removeLesson = (sectionId, lessonId) => {
    clearUpload(lessonId);
    updateCurriculum((curriculum) =>
      curriculum.map((section) => {
        if (section.id !== sectionId) return section;
        const lessons = section.lessons.filter((l) => l.id !== lessonId);
        return { ...section, lessons: lessons.length ? lessons : [createLesson()] };
      }),
    );
  };

  const addSection = () =>
    updateCurriculum((curriculum) => [...curriculum, createSection()]);

  const removeSection = (sectionId) =>
    updateCurriculum((curriculum) => {
      const updated = curriculum.filter((s) => s.id !== sectionId);
      return updated.length ? updated : [createSection()];
    });

  // ─── Tab navigation ────────────────────────────────────────────────────────
  const tabOrder = ["basic", "curriculum", "pricing", "settings"];
  const currentTabIndex = tabOrder.indexOf(activeTab);

  const goToNextTab = () => {
    if (currentTabIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentTabIndex + 1]);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
  };

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabOrder[currentTabIndex - 1]);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
  };

  // ─── Reset ─────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({ ...defaultFormData, curriculum: [createSection()] });
    setThumbnailFile(null);
    setCoverFile(null);
    setActiveTab("basic");
  };

  return {
    // State
    formData,
    setFormData,
    thumbnailFile,
    setThumbnailFile,
    coverFile,
    setCoverFile,
    activeTab,
    setActiveTab,
    // Field handlers
    handleChange,
    handleLearningChange,
    addLearning,
    removeLearning,
    handleFileChange,
    // Curriculum handlers
    handleSectionTitleChange,
    handleLessonChange,
    handleVideoUpload,
    handleCancelUpload,
    removeLesson,
    addSection,
    removeSection,
    // Chunked upload state (progress per lesson id)
    chunkUploads,
    // Tab navigation
    tabOrder,
    currentTabIndex,
    goToNextTab,
    goToPrevTab,
    // Utilities
    resetForm,
  };
};