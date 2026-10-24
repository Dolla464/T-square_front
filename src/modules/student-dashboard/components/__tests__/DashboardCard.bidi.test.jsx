import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardCard from "../DashboardCard";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "ar" },
  }),
}));

const arabicQuizTitle = "اختبار الوحدة 3 — Intro to JS";
const latinCourseName = "Full Stack Bootcamp";

describe("DashboardCard bidi", () => {
  it("uses dir=auto on quiz title and course name without ltr body wrapper", () => {
    render(
      <DashboardCard
        type="quiz"
        t={(key) => key}
        item={{
          title: arabicQuizTitle,
          courseName: latinCourseName,
          duration: 30,
          total_marks: 10,
          has_attempt: false,
          totalQuestions: 5,
          correctAnswers: 0,
        }}
      />,
    );

    const body = screen.getByText(arabicQuizTitle).closest(".quiz-card-body");
    expect(body).not.toHaveAttribute("dir", "ltr");

    expect(screen.getByText(arabicQuizTitle)).toHaveAttribute("dir", "auto");
    expect(screen.getByText(latinCourseName)).toHaveAttribute("dir", "auto");
  });

  it("keeps duration and marks meta in ltr containers", () => {
    render(
      <DashboardCard
        type="quiz"
        t={(key) => key}
        item={{
          title: arabicQuizTitle,
          courseName: latinCourseName,
          duration: 30,
          total_marks: 10,
          has_attempt: false,
          totalQuestions: 5,
          correctAnswers: 0,
        }}
      />,
    );

    expect(screen.getByText(/30 mins/)).toHaveAttribute("dir", "ltr");
    expect(screen.getByText(/10 marks/)).toHaveAttribute("dir", "ltr");
  });
});
