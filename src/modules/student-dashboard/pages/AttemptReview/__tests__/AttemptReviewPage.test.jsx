import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ForbiddenProvider } from "../../../../../contexts/ForbiddenContext";
import AttemptReviewPage from "../AttemptReviewPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ attemptId: "42", quizId: "7" }),
}));

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }) => <>{children}</>,
}));

vi.mock("../../../services/dashboardService", () => ({
  getAttemptReview: vi.fn().mockResolvedValue({
    data: {
      data: {
        exam_title: "Sample Exam",
        score: 8,
        total_marks: 10,
        finished_at: "2026-01-01",
      },
    },
  }),
}));

vi.mock("../../../../shared-dashboard/components/AttemptAnswerReview/AttemptAnswerReview", () => ({
  default: () => <div data-testid="attempt-answer-review" />,
}));

vi.mock("../../../../shared-dashboard/components/AttemptAnswerReview/IntegrityEventsSection", () => ({
  default: () => null,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en" },
  }),
}));

function renderPage() {
  return render(
    <ForbiddenProvider>
      <AttemptReviewPage role="student" />
    </ForbiddenProvider>,
  );
}

describe("AttemptReviewPage student navigation", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("navigates back to exam results for student role", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "attempt_review.back_to_exam_results" })).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: "attempt_review.back_to_exam_results" }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/student/exam-results");
  });
});
