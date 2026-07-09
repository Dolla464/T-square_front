import { useState, useRef, useCallback } from "react";
import { createCourseDraft } from "../../../services/coursesServices";

/**
 * Tracks per-lesson upload UI state and provides draft / validation helpers.
 */
export const useLessonVideoUpload = () => {
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

  const validateBasicInfo = useCallback((formData, isArabic) => {
    if (!formData.title?.trim()) {
      return isArabic
        ? "يرجى إدخال عنوان الكورس في البيانات الأساسية أولاً"
        : "Please enter the course title in Basic Info first";
    }
    if (!formData.category_id) {
      return isArabic
        ? "يرجى اختيار التصنيف في البيانات الأساسية أولاً"
        : "Please select a category in Basic Info first";
    }
    if (!formData.instructor_id) {
      return isArabic
        ? "يرجى اختيار المدرب في البيانات الأساسية أولاً"
        : "Please select an instructor in Basic Info first";
    }
    return null;
  }, []);

  const buildDraftPayload = useCallback((formData) => ({
    title: formData.title?.trim(),
    category_id: formData.category_id,
    instructor_id: formData.instructor_id,
    status: "draft",
    slug: formData.slug || undefined,
    short_description: formData.short_description || undefined,
    description: formData.description || undefined,
    level: formData.level || undefined,
    language: formData.language || undefined,
  }), []);

  const ensureCourseDraft = useCallback(
    async (formData, courseId, isArabic) => {
      if (courseId) return courseId;

      const validationError = validateBasicInfo(formData, isArabic);
      if (validationError) {
        throw new Error(validationError);
      }

      const response = await createCourseDraft(buildDraftPayload(formData));
      const created = response?.data ?? response;

      if (!created?.id) {
        throw new Error(
          isArabic ? "فشل حفظ مسودة الكورس" : "Failed to save course draft",
        );
      }

      return created;
    },
    [validateBasicInfo, buildDraftPayload],
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
