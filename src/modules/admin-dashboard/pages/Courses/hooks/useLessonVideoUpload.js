import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { createCourseDraft } from "../../../services/coursesServices";

/**
 * Tracks per-lesson upload UI state and provides draft / validation helpers.
 */
export const useLessonVideoUpload = () => {
  const { t } = useTranslation("adminDashboard");
  const [uploads, setUploads] = useState({});
  const abortControllersRef = useRef({});

  const patch = useCallback((lessonKey, updates) => {
    setUploads((prev) => ({
      ...prev,
      [lessonKey]: { ...(prev[lessonKey] ?? {}), ...updates },
    }));
  }, []);

  const getAbortController = useCallback((lessonKey) => {
    if (abortControllersRef.current[lessonKey]) {
      abortControllersRef.current[lessonKey].abort();
    }
    const controller = new AbortController();
    abortControllersRef.current[lessonKey] = controller;
    return controller;
  }, []);

  const cancelUpload = useCallback(
    (lessonKey) => {
      const ctrl = abortControllersRef.current[lessonKey];
      if (ctrl) {
        ctrl.abort();
        delete abortControllersRef.current[lessonKey];
      }
      patch(lessonKey, {
        progress: 0,
        status: "cancelled",
        error: null,
        isUploading: false,
      });
    },
    [patch],
  );

  const clearUpload = useCallback((lessonKey) => {
    cancelUpload(lessonKey);
    setUploads((prev) => {
      const next = { ...prev };
      delete next[lessonKey];
      return next;
    });
  }, [cancelUpload]);

  const validateBasicInfo = useCallback(
    (formData) => {
      if (!formData.title?.trim()) {
        return t("courses_page.validation_title_required");
      }
      if (!formData.category_id) {
        return t("courses_page.validation_category_required");
      }
      if (!formData.instructor_ids?.length) {
        return t("courses_page.validation_instructor_required");
      }
      return null;
    },
    [t],
  );

  const buildDraftPayload = useCallback((formData) => ({
    title: formData.title?.trim(),
    category_id: formData.category_id,
    instructor_ids: formData.instructor_ids || [],
    status: "draft",
    slug: formData.slug || undefined,
    short_description: formData.short_description || undefined,
    description: formData.description || undefined,
    level: formData.level || undefined,
    language: formData.language || undefined,
  }), []);

  const ensureCourseDraft = useCallback(
    async (formData, courseId) => {
      if (courseId) return courseId;

      const validationError = validateBasicInfo(formData);
      if (validationError) {
        throw new Error(validationError);
      }

      const response = await createCourseDraft(buildDraftPayload(formData));
      const created = response?.data ?? response;

      if (!created?.id) {
        throw new Error(t("courses_page.draft_save_failed"));
      }

      return created;
    },
    [validateBasicInfo, buildDraftPayload, t],
  );

  return {
    uploads,
    patch,
    getAbortController,
    cancelUpload,
    clearUpload,
    validateBasicInfo,
    ensureCourseDraft,
  };
};
