import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";

// Relative date helper to make date-range filters work relative to execution time
const now = new Date();
const getPastDate = (daysAgo) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

// Initial mock quizzes list (6 items: 5 active, 1 archived/deleted)
const initialQuizzes = [
  {
    id: 1,
    title: "JavaScript Basics Quiz",
    course_id: 1,
    course_name: "React Development",
    questions_count: 10,
    duration: 20,
    status: "active",
    description: "Covers JavaScript fundamentals, ES6+ features, and basic runtime mechanisms.",
    created_at: getPastDate(2), // 2 days ago (matches last_week, last_month, last_year)
    deleted: false,
  },
  {
    id: 2,
    title: "CSS Flexbox & Grid Exam",
    course_id: 2,
    course_name: "HTML/CSS Basics",
    questions_count: 15,
    duration: 30,
    status: "active",
    description: "Practical questions on responsive alignments, layout frameworks, grid structures.",
    created_at: getPastDate(5), // 5 days ago (matches last_week, last_month, last_year)
    deleted: false,
  },
  {
    id: 3,
    title: "State Management in React",
    course_id: 1,
    course_name: "React Development",
    questions_count: 20,
    duration: 40,
    status: "inactive",
    description: "Questions about React Context API, Zustand, Redux Toolkit, and local component states.",
    created_at: getPastDate(20), // 20 days ago (matches last_month, last_year)
    deleted: false,
  },
  {
    id: 4,
    title: "Node.js REST APIs",
    course_id: 3,
    course_name: "Advanced Node.js",
    questions_count: 25,
    duration: 50,
    status: "active",
    description: "Covers Express routing, middleware implementation, error handling, and file uploads.",
    created_at: getPastDate(120), // 4 months ago (matches last_year)
    deleted: false,
  },
  {
    id: 5,
    title: "Database Schema Design Quiz",
    course_id: 4,
    course_name: "Database Fundamentals",
    questions_count: 30,
    duration: 60,
    status: "inactive",
    description: "Covers normalization forms (1NF, 2NF, 3NF), foreign keys, indexes, and SQL constraints.",
    created_at: getPastDate(400), // ~1.1 years ago (matches all_time only)
    deleted: false,
  },
  {
    id: 6,
    title: "Old HTML Forms Exam (Archived)",
    course_id: 2,
    course_name: "HTML/CSS Basics",
    questions_count: 8,
    duration: 15,
    status: "inactive",
    description: "An obsolete exam for basic HTML form elements before semantic form validations.",
    created_at: getPastDate(8), // 8 days ago (matches last_month, last_year)
    deleted: true,
  },
];

export const useQuizzes = () => {
  const { t } = useTranslation(["adminDashboard"]);

  // We keep mockQuizzes in local state to simulate backend updates
  const [mockQuizzes, setMockQuizzes] = useState(initialQuizzes);
  const [quizzes, setQuizzes] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination metadata mock
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
        // Simulate minor API lag
        await new Promise((resolve) => setTimeout(resolve, 300));

        let filtered = [...mockQuizzes];

        // 1. Soft-delete filter
        const showTrash = !!params.trash;
        filtered = filtered.filter((q) => !!q.deleted === showTrash);

        // 2. Keyword Search (exam title, course name, and description)
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filtered = filtered.filter(
            (q) =>
              (q.title && q.title.toLowerCase().includes(searchLower)) ||
              (q.course_name && q.course_name.toLowerCase().includes(searchLower)) ||
              (q.description && q.description.toLowerCase().includes(searchLower))
          );
        }

        // 3. Status Filter (active / inactive)
        if (params.status && params.status !== "all") {
          filtered = filtered.filter((q) => q.status === params.status);
        }

        // 4. Course Filter
        if (params.course_id && params.course_id !== "all") {
          filtered = filtered.filter(
            (q) => q.course_id === parseInt(params.course_id)
          );
        }

        // 5. Date Period Filter (Last week, last month, last year)
        if (params.period && params.period !== "all") {
          const filterNow = new Date();
          filtered = filtered.filter((q) => {
            if (!q.created_at) return false;
            const created = new Date(q.created_at);
            const diffTime = Math.abs(filterNow - created);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (params.period === "last_week") return diffDays <= 7;
            if (params.period === "last_month") return diffDays <= 30;
            if (params.period === "last_year") return diffDays <= 365;
            return true;
          });
        }

        // Simulate pagination
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
        description: payload.description || "",
        created_at: new Date().toISOString(),
        deleted: false,
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
            description: payload.description || q.description,
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

  // Soft delete simulation
  const deleteQuiz = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const updated = mockQuizzes.map((q) =>
        q.id === parseInt(id) ? { ...q, deleted: true, deleted_at: new Date().toISOString() } : q
      );
      setMockQuizzes(updated);

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
  };

  // Restore simulation
  const restoreQuiz = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const updated = mockQuizzes.map((q) =>
        q.id === parseInt(id) ? { ...q, deleted: false, deleted_at: null } : q
      );
      setMockQuizzes(updated);

      toastSuccess(t("quizzes_page.restore_success", "Quiz restored successfully"));
      return true;
    } catch (err) {
      toastError("Failed to restore quiz.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Force Delete simulation (permanent deletion)
  const forceDeleteQuiz = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const updated = mockQuizzes.filter((q) => q.id !== parseInt(id));
      setMockQuizzes(updated);

      toastSuccess(t("quizzes_page.force_deleted_success", "Quiz deleted permanently"));
      return true;
    } catch (err) {
      toastError("Failed to permanently delete quiz.");
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
    restoreQuiz,
    forceDeleteQuiz,
    toggleQuizStatus,
  };
};
