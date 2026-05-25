import { useState } from "react";
import {
  defaultFormData,
  createLesson,
  createSection,
} from "../utils/courseHelpers";

/**
 * Encapsulates all form state and mutation handlers for the Course form.
 * Pass the returned values down via props to CourseForm and its tab children.
 */
export const useCourseFormLogic = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

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
   * Handles video file selection.
   * Stores the raw File, sets display name, and auto-calculates duration
   * via the browser's native video metadata API.
   */
  const handleVideoUpload = (sectionId, lessonId, uploadedFile) => {
    if (!uploadedFile) return;

    handleLessonChange(sectionId, lessonId, "videoFile", uploadedFile);
    handleLessonChange(sectionId, lessonId, "video", uploadedFile.name);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const totalSeconds = Math.floor(video.duration);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const formatted =
        hours > 0
          ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
          : `${minutes}:${String(seconds).padStart(2, "0")}`;
      handleLessonChange(sectionId, lessonId, "duration", formatted);
    };
    video.onerror = () => console.error("Failed to load video metadata");
    video.src = URL.createObjectURL(uploadedFile);
  };

  const removeLesson = (sectionId, lessonId) =>
    updateCurriculum((curriculum) =>
      curriculum.map((section) => {
        if (section.id !== sectionId) return section;
        const lessons = section.lessons.filter((l) => l.id !== lessonId);
        return { ...section, lessons: lessons.length ? lessons : [createLesson()] };
      }),
    );

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
    removeLesson,
    addSection,
    removeSection,
    // Tab navigation
    tabOrder,
    currentTabIndex,
    goToNextTab,
    goToPrevTab,
    // Utilities
    resetForm,
  };
};