import { useState, useRef, useEffect, useCallback } from "react";
import {
  defaultFormData,
  createLesson,
  createSection,
} from "../utils/courseHelpers";
import { useLessonVideoUpload } from "./useLessonVideoUpload";

/**
 * Encapsulates all form state and mutation handlers for the Course form.
 */
export const useCourseFormLogic = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const {
    uploads: chunkUploads,
    patch: patchUpload,
    getAbortController,
    cancelUpload,
    clearUpload,
    ensureCourseDraft,
  } = useLessonVideoUpload();

  const blobUrlsRef = useRef({});

  useEffect(() => {
    const urlsRef = blobUrlsRef;
    return () => {
      Object.values(urlsRef.current).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const handleVideoFileReady = useCallback(
    (sectionId, lessonId, { blobUrl, durationSeconds, durationFormatted }) => {
      if (blobUrlsRef.current[lessonId]) {
        URL.revokeObjectURL(blobUrlsRef.current[lessonId]);
      }
      blobUrlsRef.current[lessonId] = blobUrl;

      handleLessonChange(sectionId, lessonId, "uploadedVideoUrl", null);
      handleLessonChange(sectionId, lessonId, "blobUrl", blobUrl);
      handleLessonChange(sectionId, lessonId, "uploadError", null);
      handleLessonChange(sectionId, lessonId, "isUploading", true);

      if (durationSeconds != null) {
        handleLessonChange(sectionId, lessonId, "duration", durationSeconds);
        handleLessonChange(
          sectionId,
          lessonId,
          "durationFormatted",
          durationFormatted,
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleVideoUploadComplete = useCallback(
    (sectionId, lessonId, serverResponse) => {
      handleLessonChange(
        sectionId,
        lessonId,
        "uploadedVideoUrl",
        serverResponse.video_url,
      );
      if (serverResponse.duration_seconds != null) {
        handleLessonChange(
          sectionId,
          lessonId,
          "duration",
          serverResponse.duration_seconds,
        );
        const h = Math.floor(serverResponse.duration_seconds / 3600);
        const m = Math.floor((serverResponse.duration_seconds % 3600) / 60);
        const s = serverResponse.duration_seconds % 60;
        const formatted =
          h > 0
            ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
            : `${m}:${String(s).padStart(2, "0")}`;
        handleLessonChange(sectionId, lessonId, "durationFormatted", formatted);
      }
      handleLessonChange(sectionId, lessonId, "isUploading", false);
      handleLessonChange(sectionId, lessonId, "uploadError", null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleVideoUploadError = useCallback(
    (sectionId, lessonId, message) => {
      handleLessonChange(sectionId, lessonId, "isUploading", false);
      handleLessonChange(sectionId, lessonId, "uploadError", message);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleVideoUploadStateChange = useCallback(
    (lessonId, state) => {
      patchUpload(lessonId, state);
      if (state.isUploading != null) {
        // sync isUploading on lesson for legacy UI bits
      }
    },
    [patchUpload],
  );

  const handleCancelUpload = useCallback((sectionId, lessonId) => {
    cancelUpload(lessonId);
    if (blobUrlsRef.current[lessonId]) {
      URL.revokeObjectURL(blobUrlsRef.current[lessonId]);
      delete blobUrlsRef.current[lessonId];
    }
    updateCurriculum((curriculum) =>
      curriculum.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          lessons: section.lessons.map((lesson) =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  isUploading: false,
                  video: "",
                  blobUrl: null,
                  uploadedVideoUrl: null,
                  uploadError: null,
                  duration: "",
                  durationFormatted: "",
                }
              : lesson,
          ),
        };
      }),
    );
  }, [cancelUpload]);

  const removeLesson = (sectionId, lessonId) => {
    clearUpload(lessonId);
    if (blobUrlsRef.current[lessonId]) {
      URL.revokeObjectURL(blobUrlsRef.current[lessonId]);
      delete blobUrlsRef.current[lessonId];
    }
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

  const tabOrder = ["basic", "curriculum", "lessons", "pricing", "settings"];
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

  const resetForm = () => {
    setFormData({ ...defaultFormData, curriculum: [createSection()] });
    setThumbnailFile(null);
    setCoverFile(null);
    setActiveTab("basic");
  };

  return {
    formData,
    setFormData,
    thumbnailFile,
    setThumbnailFile,
    coverFile,
    setCoverFile,
    activeTab,
    setActiveTab,
    handleChange,
    handleLearningChange,
    addLearning,
    removeLearning,
    handleFileChange,
    handleSectionTitleChange,
    handleLessonChange,
    handleVideoFileReady,
    handleVideoUploadComplete,
    handleVideoUploadError,
    handleVideoUploadStateChange,
    handleCancelUpload,
    removeLesson,
    addSection,
    removeSection,
    chunkUploads,
    ensureCourseDraft,
    getAbortController,
    tabOrder,
    currentTabIndex,
    goToNextTab,
    goToPrevTab,
    resetForm,
  };
};
