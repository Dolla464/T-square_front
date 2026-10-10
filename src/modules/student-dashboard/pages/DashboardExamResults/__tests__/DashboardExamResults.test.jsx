import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import DashboardExamResults from "../DashboardExamResults";

vi.mock("../../../../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { name: "Jane Doe" } }),
}));

vi.mock("../../../hooks/useQuizzes", () => ({
  useQuizzes: vi.fn(),
}));

vi.mock("../../../components/QuizResultCard", () => ({
  default: ({ quiz }) => <div data-testid="result-card">{quiz.title}</div>,
}));

vi.mock("../../../components/StatCard", () => ({
  default: ({ label, value }) => (
    <div data-testid="stat-card">
      {label}: {value}
    </div>
  ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, params) => {
      if (params?.name) return `Exam Results ${params.name}`;
      if (params?.count !== undefined) return `${params.count} attempts`;
      return key;
    },
  }),
}));

import { useQuizzes } from "../../../hooks/useQuizzes";

const attemptedQuiz = {
  id: 1,
  title: "Midterm Exam",
  course_title: "React Basics",
  has_attempt: true,
  attempts_count: 2,
  is_passed_before: true,
  is_locked: false,
};

const unattemptedQuiz = {
  id: 2,
  title: "Final Exam",
  course_title: "Node Advanced",
  has_attempt: false,
  attempts_count: 0,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardExamResults />
    </MemoryRouter>,
  );
}

describe("DashboardExamResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders attempted exams and excludes exams without attempts", () => {
    useQuizzes.mockReturnValue({
      quizzes: [attemptedQuiz, unattemptedQuiz],
      loading: false,
    });

    renderPage();

    expect(screen.getByText("Midterm Exam")).toBeInTheDocument();
    expect(screen.queryByText("Final Exam")).not.toBeInTheDocument();
  });

  it("shows empty state with CTA to quizzes when there are no results", () => {
    useQuizzes.mockReturnValue({
      quizzes: [unattemptedQuiz],
      loading: false,
    });

    renderPage();

    expect(screen.getByText("exam_results.empty")).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: "exam_results.empty_cta" });
    expect(cta).toHaveAttribute("href", "/student/quizzes");
  });

  it("does not render a refresh button", () => {
    useQuizzes.mockReturnValue({
      quizzes: [attemptedQuiz],
      loading: false,
    });

    renderPage();

    expect(screen.queryByText("attendance.refresh")).not.toBeInTheDocument();
  });

  it("filters results by search query", () => {
    useQuizzes.mockReturnValue({
      quizzes: [
        attemptedQuiz,
        {
          ...attemptedQuiz,
          id: 3,
          title: "Other Quiz",
          course_title: "CSS Mastery",
          is_passed_before: false,
          is_locked: true,
        },
      ],
      loading: false,
    });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText("exam_results.search_placeholder"), {
      target: { value: "react" },
    });

    expect(screen.getByText("Midterm Exam")).toBeInTheDocument();
    expect(screen.queryByText("Other Quiz")).not.toBeInTheDocument();
  });

  it("filters results by passed status", () => {
    useQuizzes.mockReturnValue({
      quizzes: [
        attemptedQuiz,
        {
          ...attemptedQuiz,
          id: 4,
          title: "Failed Quiz",
          is_passed_before: false,
          is_locked: true,
        },
      ],
      loading: false,
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /exam_results.filters.passed/i }));

    expect(screen.getByText("Midterm Exam")).toBeInTheDocument();
    expect(screen.queryByText("Failed Quiz")).not.toBeInTheDocument();
  });
});
