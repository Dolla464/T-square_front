import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import QuizResultsContent from "../QuizResultsContent";

vi.mock("../../../shared-dashboard/components/AttemptAnswerReview/AttemptReviewPanel", () => ({
  default: ({ enabled }) =>
    enabled ? <div data-testid="attempt-review-panel">Review Panel</div> : null,
}));

const t = (key, params) => {
  if (params?.num !== undefined) return `Attempt ${params.num}`;
  return key;
};

const quiz = { id: 7, title: "Midterm" };
const results = {
  data: [
    {
      attempt_id: 42,
      score: 8,
      total_marks: 10,
      is_passed: true,
      finished_at: "2026-01-01",
    },
  ],
};

describe("QuizResultsContent", () => {
  it("shows answers inline when an attempt is selected", () => {
    render(
      <QuizResultsContent
        quiz={quiz}
        results={results}
        loading={false}
        error={null}
        t={t}
        isArabic={false}
      />,
    );

    expect(screen.queryByRole("button", { name: "attempt_review.view_answers" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("attempt-review-panel")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Attempt 1/i }));

    expect(screen.getByTestId("attempt-review-panel")).toBeInTheDocument();
  });
});
