import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import QuizResultCard from "../QuizResultCard";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("i18next", () => ({
  default: { language: "en" },
}));

const t = (key, params) => {
  if (params?.count !== undefined) return `${params.count} attempts`;
  return key;
};

const quiz = {
  id: 5,
  title: "Final Exam",
  course_title: "Laravel Basics",
  attempts_count: 2,
  has_attempt: true,
  is_passed_before: true,
  is_locked: false,
};

describe("QuizResultCard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders exam metadata and status like quiz cards", () => {
    render(
      <MemoryRouter>
        <QuizResultCard quiz={quiz} t={t} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Final Exam")).toBeInTheDocument();
    expect(screen.getByText("Laravel Basics")).toBeInTheDocument();
    expect(screen.getByText("exam_results.status.passed")).toBeInTheDocument();
    expect(screen.getByText("2 attempts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "exam_results.show_details" })).toBeInTheDocument();
    expect(screen.queryByTestId("quiz-results-content")).not.toBeInTheDocument();
  });

  it("navigates to exam result details page when show details is clicked", () => {
    render(
      <MemoryRouter>
        <QuizResultCard quiz={quiz} t={t} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "exam_results.show_details" }));
    expect(mockNavigate).toHaveBeenCalledWith("/student/exam-results/5");
  });
});
