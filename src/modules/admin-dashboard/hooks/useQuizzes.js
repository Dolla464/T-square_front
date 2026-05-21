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
    questions_count: 3,
    duration: 20,
    status: "active",
    description: "Covers JavaScript fundamentals, ES6+ features, and basic runtime mechanisms.",
    created_at: getPastDate(2),
    deleted: false,
    max_attempts: 3,
    total_mark: 30,
    passing_mark: 15,
    final_exam: false,
    shuffle_questions: true,
    questions: [
      {
        id: 101,
        question_text: "What is the output of typeof null in JavaScript?",
        answers: ["object", "null", "undefined", "number"],
        correct_answer: "object",
        correct_answer_index: 0,
        question_mark: 10,
      },
      {
        id: 102,
        question_text: "Which of the following is NOT a JavaScript data type?",
        answers: ["String", "Boolean", "Float", "Undefined"],
        correct_answer: "Float",
        correct_answer_index: 2,
        question_mark: 10,
      },
      {
        id: 103,
        question_text: "Which keyword is used to define a block-scoped variable in ES6?",
        answers: ["var", "let", "define", "global"],
        correct_answer: "let",
        correct_answer_index: 1,
        question_mark: 10,
      }
    ]
  },
  {
    id: 2,
    title: "CSS Flexbox & Grid Exam",
    course_id: 2,
    course_name: "HTML/CSS Basics",
    questions_count: 2,
    duration: 30,
    status: "active",
    description: "Practical questions on responsive alignments, layout frameworks, grid structures.",
    created_at: getPastDate(5),
    deleted: false,
    max_attempts: 2,
    total_mark: 20,
    passing_mark: 10,
    final_exam: false,
    shuffle_questions: false,
    questions: [
      {
        id: 201,
        question_text: "Which CSS property is used to align flex items along the main axis?",
        answers: ["align-items", "justify-content", "align-content", "grid-gap"],
        correct_answer: "justify-content",
        correct_answer_index: 1,
        question_mark: 10,
      },
      {
        id: 202,
        question_text: "What does flex-grow: 2 do when container has extra space?",
        answers: [
          "Grows twice as fast as elements with flex-grow: 1",
          "Sets minimum height to 200px",
          "Forces element to span 2 grid cells",
          "Shrinks elements by 50%"
        ],
        correct_answer: "Grows twice as fast as elements with flex-grow: 1",
        correct_answer_index: 0,
        question_mark: 10,
      }
    ]
  },
  {
    id: 3,
    title: "State Management in React",
    course_id: 1,
    course_name: "React Development",
    questions_count: 2,
    duration: 40,
    status: "inactive",
    description: "Questions about React Context API, Zustand, Redux Toolkit, and local component states.",
    created_at: getPastDate(20),
    deleted: false,
    max_attempts: 5,
    total_mark: 20,
    passing_mark: 12,
    final_exam: true,
    shuffle_questions: true,
    questions: [
      {
        id: 301,
        question_text: "Which React hook is used to access Context value?",
        answers: ["useContext", "useState", "useMemo", "useContextAPI"],
        correct_answer_index: 0,
        question_mark: 10,
      },
      {
        id: 302,
        question_text: "Is Zustand a global state manager for React?",
        answers: ["Yes", "No", "Only for Angular", "Only for Vue"],
        correct_answer_index: 0,
        question_mark: 10,
      }
    ]
  },
  {
    id: 4,
    title: "Node.js REST APIs",
    course_id: 3,
    course_name: "Advanced Node.js",
    questions_count: 2,
    duration: 50,
    status: "active",
    description: "Covers Express routing, middleware implementation, error handling, and file uploads.",
    created_at: getPastDate(120),
    deleted: false,
    max_attempts: 1,
    total_mark: 20,
    passing_mark: 10,
    final_exam: true,
    shuffle_questions: false,
    questions: [
      {
        id: 401,
        question_text: "Which Express method is used to define middleware?",
        answers: ["app.use()", "app.get()", "app.post()", "app.middleware()"],
        correct_answer_index: 0,
        question_mark: 10,
      },
      {
        id: 402,
        question_text: "What is NPM short for?",
        answers: ["Node Project Manager", "Node Package Manager", "Net Protocol Module", "New Package Method"],
        correct_answer_index: 1,
        question_mark: 10,
      }
    ]
  },
  {
    id: 5,
    title: "Database Schema Design Quiz",
    course_id: 4,
    course_name: "Database Fundamentals",
    questions_count: 1,
    duration: 60,
    status: "inactive",
    description: "Covers normalization forms (1NF, 2NF, 3NF), foreign keys, indexes, and SQL constraints.",
    created_at: getPastDate(400),
    deleted: false,
    max_attempts: 3,
    total_mark: 10,
    passing_mark: 5,
    final_exam: false,
    shuffle_questions: true,
    questions: [
      {
        id: 501,
        question_text: "What is 1NF in database normalization?",
        answers: [
          "Atomic values only",
          "No transitive dependencies",
          "No partial dependencies",
          "No duplicate rows"
        ],
        correct_answer_index: 0,
        question_mark: 10,
      }
    ]
  },
  {
    id: 6,
    title: "Old HTML Forms Exam (Archived)",
    course_id: 2,
    course_name: "HTML/CSS Basics",
    questions_count: 1,
    duration: 15,
    status: "inactive",
    description: "An obsolete exam for basic HTML form elements before semantic form validations.",
    created_at: getPastDate(8),
    deleted: true,
    max_attempts: 1,
    total_mark: 10,
    passing_mark: 5,
    final_exam: false,
    shuffle_questions: false,
    questions: [
      {
        id: 601,
        question_text: "Which HTML tag is used to create a text input?",
        answers: ["<input type='text'>", "<textarea>", "<select>", "<textfield>"],
        correct_answer_index: 0,
        question_mark: 10,
      }
    ]
  },
];

export const useQuizzes = () => {
  const { t } = useTranslation(["adminDashboard"]);

  // Use localStorage or standard state, using standard state backed by static definition
  // to avoid losing modifications on component unmount in same session we can use static closure storage
  const [mockQuizzes, setMockQuizzes] = useState(() => {
    const saved = localStorage.getItem("t_square_mock_quizzes");
    return saved ? JSON.parse(saved) : initialQuizzes;
  });

  const saveToLocalStorage = (data) => {
    localStorage.setItem("t_square_mock_quizzes", JSON.stringify(data));
  };

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
        max_attempts: parseInt(payload.max_attempts) || 3,
        total_mark: parseInt(payload.total_mark) || 100,
        passing_mark: parseInt(payload.passing_mark) || 50,
        final_exam: !!payload.final_exam,
        shuffle_questions: !!payload.shuffle_questions,
        questions: [],
      };

      const updated = [newQuiz, ...mockQuizzes];
      setMockQuizzes(updated);
      saveToLocalStorage(updated);

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
            questions_count: q.questions ? q.questions.length : (parseInt(payload.questions_count) || 0),
            duration: parseInt(payload.duration) || 0,
            status: payload.status || q.status,
            description: payload.description || q.description,
            max_attempts: parseInt(payload.max_attempts) || q.max_attempts,
            total_mark: parseInt(payload.total_mark) || q.total_mark,
            passing_mark: parseInt(payload.passing_mark) || q.passing_mark,
            final_exam: payload.final_exam !== undefined ? !!payload.final_exam : q.final_exam,
            shuffle_questions: payload.shuffle_questions !== undefined ? !!payload.shuffle_questions : q.shuffle_questions,
          };
        }
        return q;
      });

      setMockQuizzes(updated);
      saveToLocalStorage(updated);
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
      saveToLocalStorage(updated);

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
      saveToLocalStorage(updated);

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
      saveToLocalStorage(updated);

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
      saveToLocalStorage(updated);
      toastSuccess(t("success.updated", "Updated successfully"));
      return true;
    } catch (err) {
      toastError("Failed to update status.");
      return false;
    }
  };

  // Save Quiz Questions update
  const saveQuizQuestions = async (id, questions) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const updated = mockQuizzes.map((q) => {
        if (q.id === parseInt(id)) {
          return {
            ...q,
            questions: questions,
            questions_count: questions.length,
          };
        }
        return q;
      });
      setMockQuizzes(updated);
      saveToLocalStorage(updated);
      toastSuccess("Saved exam questions successfully");
      return true;
    } catch (err) {
      toastError("Failed to save questions");
      return false;
    } finally {
      setLoading(false);
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
    saveQuizQuestions,
  };
};
