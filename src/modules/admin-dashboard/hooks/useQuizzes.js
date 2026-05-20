import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";

// Initial mock quizzes list (5 items)
const initialQuizzes = [
  {
    id: 1,
    title: "JavaScript Basics Quiz",
    course_id: 1,
    course_name: "React Development",
    questions_count: 10,
    duration: 20,
    status: "active",
  },
  {
    id: 2,
    title: "CSS Flexbox & Grid Exam",
    course_id: 2,
    course_name: "HTML/CSS Basics",
    questions_count: 15,
    duration: 30,
    status: "active",
  },
  {
    id: 3,
    title: "State Management in React",
    course_id: 1,
    course_name: "React Development",
    questions_count: 20,
    duration: 40,
    status: "inactive",
  },
  {
    id: 4,
    title: "Node.js REST APIs",
    course_id: 3,
    course_name: "Advanced Node.js",
    questions_count: 25,
    duration: 50,
    status: "active",
  },
  {
    id: 5,
    title: "Database Schema Design Quiz",
    course_id: 4,
    course_name: "Database Fundamentals",
    questions_count: 30,
    duration: 60,
    status: "inactive",
  },
];

export const useQuizzes = () => {
  const { t } = useTranslation(["adminDashboard"]);

  // We keep mockQuizzes in local state to simulate backend updates
  const [mockQuizzes, setMockQuizzes] = useState(initialQuizzes);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination metadata mock
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total_pages: 1,
    per_page: 10,
    total: 5,
  });

  const getQuizzes = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        // Simulate minor API lag
        await new Promise((resolve) => setTimeout(resolve, 300));

        let filtered = [...mockQuizzes];

        // Apply filters
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filtered = filtered.filter(
            (q) =>
              q.title.toLowerCase().includes(searchLower) ||
              q.course_name.toLowerCase().includes(searchLower)
          );
        }

        if (params.status && params.status !== "all") {
          filtered = filtered.filter((q) => q.status === params.status);
        }

        if (params.course_id && params.course_id !== "all") {
          filtered = filtered.filter(
            (q) => q.course_id === parseInt(params.course_id)
          );
        }

        // Simulate paging
        const page = params.page || 1;
        const perPage = 10;
        const total = filtered.length;
        const totalPages = Math.ceil(total / perPage) || 1;
        const offset = (page - 1) * perPage;
        const paginatedData = filtered.slice(offset, offset + perPage);

        setQuizzes(paginatedData);
        setPagination({
          current_page: page,
          last_page: totalPages,
          total_pages: totalPages,
          per_page: perPage,
          total: total,
        });

        return { data: paginatedData, pagination: { current_page: page, total_pages: totalPages } };
      } catch (err) {
        const errorMsg = t("errors.fetch_failed", "Failed to fetch data");
        setError(errorMsg);
        toastError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [mockQuizzes, t]
  );

  const getQuizById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const found = mockQuizzes.find((q) => q.id === parseInt(id));
        setQuiz(found || null);
        return found || null;
      } catch (err) {
        const errorMsg = t("errors.fetch_failed", "Failed to fetch data");
        setError(errorMsg);
        toastError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [mockQuizzes, t]
  );

  const createQuiz = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newId = mockQuizzes.length > 0 ? Math.max(...mockQuizzes.map((q) => q.id)) + 1 : 1;
      const newQuiz = {
        id: newId,
        title: payload.title,
        course_id: parseInt(payload.course_id),
        course_name: payload.course_name || "Custom Course",
        questions_count: parseInt(payload.questions_count) || 0,
        duration: parseInt(payload.duration) || 0,
        status: payload.status || "active",
      };

      const updated = [newQuiz, ...mockQuizzes];
      setMockQuizzes(updated);

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
  };

  const updateQuiz = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const updated = mockQuizzes.map((q) => {
        if (q.id === parseInt(id)) {
          return {
            ...q,
            title: payload.title,
            course_id: parseInt(payload.course_id),
            course_name: payload.course_name || q.course_name,
            questions_count: parseInt(payload.questions_count) || 0,
            duration: parseInt(payload.duration) || 0,
            status: payload.status || q.status,
          };
        }
        return q;
      });

      setMockQuizzes(updated);
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
  };

  const deleteQuiz = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const updated = mockQuizzes.filter((q) => q.id !== parseInt(id));
      setMockQuizzes(updated);

      toastSuccess(t("success.deleted", "Deleted successfully"));
      return true;
    } catch (err) {
      const errorMsg = t("errors.delete_failed", "Failed to delete");
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleQuizStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === "active" ? "inactive" : "active";
      const updated = mockQuizzes.map((q) =>
        q.id === parseInt(id) ? { ...q, status: nextStatus } : q
      );
      setMockQuizzes(updated);
      toastSuccess(t("success.updated", "Updated successfully"));
      return true;
    } catch (err) {
      toastError("Failed to update status.");
      return false;
    }
  };

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
    toggleQuizStatus,
  };
};
