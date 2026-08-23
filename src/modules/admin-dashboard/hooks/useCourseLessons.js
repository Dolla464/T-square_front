import { useCallback, useEffect, useState } from "react";
import {
  createCourseLesson,
  deleteCourseLesson,
  getCourseLessons,
  updateCourseLesson,
} from "../services/lessonsService";
import { toastError, toastSuccess } from "../../../components/shared/Toaster/toaster";

const emptyLesson = () => ({
  title: "",
  description: "",
  sort_order: 0,
  is_active: true,
  video_source_type: "none",
  google_drive_url: "",
  duration_seconds: "",
});

const normalizeLessonFromApi = (lesson) => ({
  ...lesson,
  google_drive_url:
    lesson.google_drive_url ||
    (lesson.google_drive_file_id
      ? `https://drive.google.com/file/d/${lesson.google_drive_file_id}/view`
      : ""),
});

export function useCourseLessons(courseId) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchLessons = useCallback(async () => {
    if (!courseId) {
      setLessons([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getCourseLessons(courseId);
      setLessons((response?.data ?? []).map(normalizeLessonFromApi));
    } catch (error) {
      toastError(error?.response?.data?.message || "Failed to load lessons.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const saveLesson = async (lesson, index) => {
    if (!courseId) {
      toastError("Save the course first before adding lessons.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: lesson.title,
        description: lesson.description || null,
        sort_order: Number(lesson.sort_order ?? index),
        is_active: Boolean(lesson.is_active),
        video_source_type: lesson.video_source_type || "none",
        google_drive_url:
          lesson.video_source_type === "google_drive" && lesson.google_drive_url
            ? lesson.google_drive_url
            : null,
        duration_seconds: lesson.duration_seconds ? Number(lesson.duration_seconds) : null,
      };

      let response;
      if (lesson.id) {
        response = await updateCourseLesson(courseId, lesson.id, payload);
      } else {
        response = await createCourseLesson(courseId, payload);
      }

      toastSuccess(response?.message || "Lesson saved.");
      await fetchLessons();
    } catch (error) {
      const validation = error?.response?.data?.errors;
      const message =
        validation?.google_drive_url?.[0] ||
        error?.response?.data?.message ||
        "Failed to save lesson.";
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  const removeLesson = async (lessonId) => {
    if (!courseId || !lessonId) return;

    setSaving(true);
    try {
      const response = await deleteCourseLesson(courseId, lessonId);
      toastSuccess(response?.message || "Lesson deleted.");
      await fetchLessons();
    } catch (error) {
      toastError(error?.response?.data?.message || "Failed to delete lesson.");
    } finally {
      setSaving(false);
    }
  };

  const addLessonDraft = () => {
    setLessons((prev) => [...prev, emptyLesson()]);
  };

  const updateLessonField = (index, field, value) => {
    setLessons((prev) =>
      prev.map((lesson, i) => (i === index ? { ...lesson, [field]: value } : lesson)),
    );
  };

  return {
    lessons,
    loading,
    saving,
    fetchLessons,
    saveLesson,
    removeLesson,
    addLessonDraft,
    updateLessonField,
  };
}
