import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ExamResultDetailsPage from "../ExamResultDetailsPage";

const mockNavigate = vi.fn();
const mockFetchResults = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }) => <>{children}</>,
}));

vi.mock("../../../hooks/useQuizzes", () => ({
  useQuizzes: vi.fn(),
}));

vi.mock("../../../hooks/useExamResults", () => ({
  useExamResults: vi.fn(),
}));

vi.mock("../../../components/QuizResultsContent", () => ({
  default: ({ quiz }) => <div data-testid="quiz-results-content">{quiz.title}</div>,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en" },
  }),
}));

import { useQuizzes } from "../../../hooks/useQuizzes";
import { useExamResults } from "../../../hooks/useExamResults";

const quiz = {
  id: 5,
  title: "Final Exam",
  course_title: "Laravel Basics",
  has_attempt: true,
  attempts_count: 2,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/student/exam-results/5"]}>
      <Routes>
        <Route path="/student/exam-results/:quizId" element={<ExamResultDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ExamResultDetailsPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockFetchResults.mockClear();

    useQuizzes.mockReturnValue({
      quizzes: [quiz],
      loading: false,
    });

    useExamResults.mockReturnValue({
      results: { data: [] },
      loading: false,
      error: null,
      fetchResults: mockFetchResults,
    });
  });

  it("fetches results and renders QuizResultsContent", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockFetchResults).toHaveBeenCalled();
    });

    expect(screen.getByTestId("quiz-results-content")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Final Exam" })).toBeInTheDocument();
  });

  it("navigates back to exam results list", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "exam_results.back_to_list" }));
    expect(mockNavigate).toHaveBeenCalledWith("/student/exam-results");
  });
});
