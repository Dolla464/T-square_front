import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";
import { getApiErrorMessage } from "../../../utils/apiErrors";
import {
  getQuizzes as apiGetQuizzes,
  getQuizById as apiGetQuizById,
  createQuiz as apiCreateQuiz,
  updateQuiz as apiUpdateQuiz,
  deleteQuiz as apiDeleteQuiz,
  toggleQuizStatus as apiToggleQuizStatus,
  getTrashedQuizzes as apiGetTrashedQuizzes,
  restoreQuiz as apiRestoreQuiz,
  forceDeleteQuiz as apiForceDeleteQuiz,
  getQuestionsForExam as apiGetQuestionsForExam,
  getQuestionById as apiGetQuestionById,
  createQuestion as apiCreateQuestion,
  updateQuestion as apiUpdateQuestion,
  deleteQuestion as apiDeleteQuestion,
  getTrashedQuestions as apiGetTrashedQuestions,
  restoreQuestion as apiRestoreQuestion,
  forceDeleteQuestion as apiForceDeleteQuestion,
} from "../services/instructorQuizzesServices";

export const useInstructorQuizzes = () => {
  const { t } = useTranslation(["adminDashboard"]);

  const [quizzes, setQuizzes] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination metadata
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total_pages: 1,
    per_page: 10,
    total: 0,
  });

  const getQuizzes = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        // Map UI params to API params
        const apiParams = {
          page: params.page || 1,
        };

        if (params.search) {
          apiParams.search = params.search;
        }

        if (params.status && params.status !== "all") {
          apiParams.status = params.status === "active" ? 1 : 0;
        }

        if (params.period && params.period !== "all") {
          apiParams.date_range = params.period;
        }

        // Call appropriate endpoint depending on params.trash flag
        const response = params.trash
          ? await apiGetTrashedQuizzes(apiParams)
          : await apiGetQuizzes(apiParams);

        const dataArray = response.data || [];
        const mapped = dataArray.map((item) => ({
          id: item.id,
          title: item.title,
          course_id: item.course?.id || item.course_id || "",
          course_name: item.course?.title || item.course_name || "",
          questions_count: item.questions_count || 0,
          duration: item.duration_minutes || item.duration || 0,
          status: item.is_active ? "active" : "inactive",
          description: item.description || "",
          created_at: item.created_at || item.deleted_at || "",
          deleted: !!item.deleted_at,
          deleted_at: item.deleted_at || null,
          max_attempts: item.max_attempts || 0,
          questions_per_attempt: item.questions_per_attempt || 0,
          total_mark: item.total_marks || item.total_mark || 0,
          passing_mark: item.passing_mark || 0,
          final_exam: !!item.is_final,
          shuffle_questions: !!item.shuffle_questions,
        }));

        setQuizzes(mapped);

        const pag = response.pagination || {};
        setPagination({
          current_page: pag.current_page || 1,
          last_page: pag.total_pages || 1,
          total_pages: pag.total_pages || 1,
          per_page: pag.per_page || 10,
          total: pag.total || mapped.length,
        });

        return { data: mapped, pagination: pag };
      } catch (err) {
        const errorMsg = t("errors.fetch_failed", "Failed to fetch data");
        setError(errorMsg);
        toastError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const getQuizById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGetQuizById(id);
        const item = response.data || {};

        const mapped = {
          id: item.id,
          title: item.title,
          course_id: item.course?.id || item.course_id || "",
          course_name: item.course?.title || item.course_name || "",
          questions_count: item.questions_count || 0,
          duration: item.duration_minutes || item.duration || 0,
          status: item.is_active ? "active" : "inactive",
          description: item.description || "",
          created_at: item.created_at || "",
          deleted: !!item.deleted_at,
          deleted_at: item.deleted_at || null,
          max_attempts: item.max_attempts || 0,
          questions_per_attempt: item.questions_per_attempt || 0,
          total_marks: item.total_marks || item.total_mark || 0,
          passing_mark: item.passing_mark || 0,
          is_active: !!item.is_active,
          is_final: !!item.is_final,
          shuffle_questions: !!item.shuffle_questions,
        };
        setQuiz(mapped);
        return mapped;
      } catch (err) {
        const errorMsg = t("errors.fetch_failed", "Failed to fetch data");
        setError(errorMsg);
        toastError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const createQuiz = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const servicePayload = {
        course_id: parseInt(payload.course_id),
        title: payload.title,
        description: payload.description || "",
        duration: parseInt(payload.duration) || 0,
        total_marks: parseFloat(payload.total_marks) || 0.00,
        passing_mark: parseFloat(payload.passing_mark) || 0.00,
        is_active: payload.is_active !== undefined ? !!payload.is_active : (payload.status === "active"),
        is_final: !!payload.is_final,
        max_attempts: parseInt(payload.max_attempts) || 1,
        questions_per_attempt: parseInt(payload.questions_per_attempt) || 1,
        shuffle_questions: !!payload.shuffle_questions,
      };

      await apiCreateQuiz(servicePayload);
      toastSuccess(t("success.created", "Created successfully"));
      return true;
    } catch (err) {
      const errorMsg = t("errors.create_failed", "Failed to create");
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const updateQuiz = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const servicePayload = {
        course_id: parseInt(payload.course_id),
        title: payload.title,
        description: payload.description || "",
        duration: parseInt(payload.duration) || 0,
        total_marks: parseFloat(payload.total_marks) || 0.00,
        passing_mark: parseFloat(payload.passing_mark) || 0.00,
        is_active: payload.is_active !== undefined ? !!payload.is_active : (payload.status === "active"),
        is_final: !!payload.is_final,
        max_attempts: parseInt(payload.max_attempts) || 1,
        questions_per_attempt: parseInt(payload.questions_per_attempt) || 1,
        shuffle_questions: !!payload.shuffle_questions,
      };

      await apiUpdateQuiz(id, servicePayload);
      toastSuccess(t("success.updated", "Updated successfully"));
      return true;
    } catch (err) {
      const errorMsg = t("errors.update_failed", "Failed to update");
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const deleteQuiz = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteQuiz(id);
      toastSuccess(t("quizzes_page.deleted_success", "Quiz moved to trash successfully"));
      return true;
    } catch (err) {
      const errorMsg = t("errors.delete_failed", "Failed to delete");
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const restoreQuiz = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiRestoreQuiz(id);
      toastSuccess(t("quizzes_page.restore_success", "Quiz restored successfully"));
      return true;
    } catch (err) {
      toastError("Failed to restore quiz.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const forceDeleteQuiz = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiForceDeleteQuiz(id);
      toastSuccess(t("quizzes_page.force_deleted_success", "Quiz deleted permanently"));
      return true;
    } catch (err) {
      toastError("Failed to permanently delete quiz.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const toggleQuizStatus = useCallback(async (id, currentStatus) => {
    setLoading(true);
    setError(null);
    try {
      const newStatusVal = currentStatus === "active" ? 0 : 1;
      await apiToggleQuizStatus(id, newStatusVal);
      toastSuccess(t("success.updated", "Updated successfully"));
      return true;
    } catch (err) {
      toastError("Failed to update status.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const getQuestionsForExam = useCallback(async (examId) => {
    try {
      const response = await apiGetQuestionsForExam(examId);
      return Array.isArray(response?.data) ? response.data : [];
    } catch (err) {
      toastError("Failed to fetch questions for exam");
      return [];
    }
  }, []);

  const getQuestionById = useCallback(async (questionId) => {
    try {
      const response = await apiGetQuestionById(questionId);
      return response.data;
    } catch (err) {
      toastError("Failed to fetch question by id");
      return null;
    }
  }, []);

  const createQuestion = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateQuestion(payload);
      toastSuccess(t("success.created", "Created successfully"));
      return response.data || true;
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, t("errors.create_failed", "Failed to create"));
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const updateQuestion = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      await apiUpdateQuestion(id, payload);
      toastSuccess(t("success.updated", "Updated successfully"));
      return true;
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, t("errors.update_failed", "Failed to update"));
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const deleteQuestion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteQuestion(id);
      toastSuccess(t("quizzes_page.deleted_success", "Question moved to trash successfully") || "Question moved to trash successfully");
      return true;
    } catch (err) {
      const errorMsg = t("errors.delete_failed", "Failed to delete");
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const getTrashedQuestions = useCallback(async (examId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGetTrashedQuestions({ exam_id: examId });
      return Array.isArray(response?.data) ? response.data : [];
    } catch (err) {
      toastError("Failed to fetch trashed questions");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreQuestion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiRestoreQuestion(id);
      toastSuccess("Question restored successfully");
      return true;
    } catch (err) {
      toastError("Failed to restore question");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const forceDeleteQuestion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiForceDeleteQuestion(id);
      toastSuccess("Question deleted permanently");
      return true;
    } catch (err) {
      toastError("Failed to permanently delete question");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    quizzes,
    quiz,
    pagination,
    loading,
    error,
    getQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    restoreQuiz,
    forceDeleteQuiz,
    toggleQuizStatus,
    getQuestionsForExam,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getTrashedQuestions,
    restoreQuestion,
    forceDeleteQuestion,
  };
};
