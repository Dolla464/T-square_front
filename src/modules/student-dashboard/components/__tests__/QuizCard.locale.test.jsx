import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import QuizCard from "../QuizCard";

let mockLanguage = "en";

vi.mock("i18next", () => ({
  default: {
    get language() {
      return mockLanguage;
    },
  },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const t = (key) => key;

const baseQuiz = {
  id: 1,
  title: "Quiz",
  description: "",
  course_title: "Course",
  is_locked: false,
  has_ongoing_attempt: false,
  remaining_attempts: 2,
  has_attempt: false,
  max_attempts: 3,
  duration: "30m",
  is_passed_before: false,
};

describe("QuizCard locale UI", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it.each(["ar", "ar-EG", "ar-SA"])("shows Arabic start label for %s", (language) => {
    mockLanguage = language;

    render(<QuizCard t={t} quiz={baseQuiz} />);

    expect(screen.getByRole("button", { name: /بدء الاختبار/i })).toBeInTheDocument();
  });

  it.each(["en", "en-US"])("shows English start label for %s", (language) => {
    mockLanguage = language;

    render(<QuizCard t={t} quiz={baseQuiz} />);

    expect(screen.getByRole("button", { name: /Start Quiz/i })).toBeInTheDocument();
  });
});
