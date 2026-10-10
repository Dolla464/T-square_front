import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import QuizCard from "../QuizCard";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("i18next", () => ({
  default: { language: "en" },
}));

vi.mock("../../../../utils/isArabicLocale", async (importOriginal) => {
  const actual = await importOriginal();
  return actual;
});

const t = (key) => key;

describe("QuizCard", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("does not render result-only UI", () => {
    render(
      <QuizCard
        t={t}
        quiz={{
          id: 10,
          title: "Sample Quiz",
          description: "Desc",
          course_title: "Course A",
          is_locked: false,
          has_ongoing_attempt: false,
          remaining_attempts: 2,
          has_attempt: true,
          max_attempts: 3,
          duration: "30m",
          is_passed_before: true,
        }}
      />,
    );

    expect(screen.queryByText(/Review/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Attempts History/i)).not.toBeInTheDocument();
    expect(document.querySelector(".quiz-modal-content")).not.toBeInTheDocument();
    expect(document.querySelector(".quiz-modal-gauge-wrapper")).not.toBeInTheDocument();
  });

  it("renders Start Quiz for a fresh exam", () => {
    render(
      <QuizCard
        t={t}
        quiz={{
          id: 11,
          title: "Fresh Quiz",
          description: "",
          course_title: "Course B",
          is_locked: false,
          has_ongoing_attempt: false,
          remaining_attempts: 3,
          has_attempt: false,
          max_attempts: 3,
          duration: "20m",
          is_passed_before: false,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Start Quiz/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/student/quizzes/11");
  });

  it("renders Resume Quiz for ongoing attempts", () => {
    render(
      <QuizCard
        t={t}
        quiz={{
          id: 12,
          title: "Ongoing Quiz",
          description: "",
          course_title: "Course C",
          is_locked: false,
          has_ongoing_attempt: true,
          remaining_attempts: 2,
          has_attempt: true,
          max_attempts: 3,
          duration: "20m",
          is_passed_before: false,
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /Resume Quiz/i })).toBeInTheDocument();
  });

  it("renders Retry for failed attempts with remaining tries", () => {
    render(
      <QuizCard
        t={t}
        quiz={{
          id: 13,
          title: "Retry Quiz",
          description: "",
          course_title: "Course D",
          is_locked: false,
          has_ongoing_attempt: false,
          remaining_attempts: 1,
          has_attempt: true,
          max_attempts: 3,
          duration: "20m",
          is_passed_before: false,
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /Retry/i })).toBeInTheDocument();
  });
});
