import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AttemptAnswerReview from "../AttemptAnswerReview";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (key === "attempt_review.question_num") {
        return `Question ${opts?.num ?? ""}`;
      }
      if (key === "attempt_review.region_label") {
        return "Answer review";
      }
      if (key.startsWith("attempt_review.summary_")) {
        return key;
      }
      if (key.startsWith("attempt_review.")) {
        return opts?.text ?? key;
      }
      return key;
    },
    i18n: { language: "en" },
  }),
}));

const choiceText = "25. الإجابة الصحيحة هي الاختيار B.";

const review = {
  summary: { correct: 0, incorrect: 1, unanswered: 0 },
  questions: [
    {
      id: 7,
      type: "multiple_choice",
      result_status: "incorrect",
      question_text: "Sample question",
      choices: [
        {
          id: 1,
          choice_text: choiceText,
          state: "wrong_selected",
        },
      ],
    },
  ],
};

describe("AttemptAnswerReview bidi (dir=auto on option text)", () => {
  it("sets dir=auto on option-text for choice_text", () => {
    render(<AttemptAnswerReview review={review} />);

    const optionText = screen.getByText(choiceText);
    expect(optionText).toHaveClass("option-text");
    expect(optionText).toHaveAttribute("dir", "auto");
  });

  it("keeps wrapper dir from locale (ltr for en) without dir=auto on wrapper", () => {
    render(<AttemptAnswerReview review={review} />);

    const region = screen.getByRole("region", { name: "Answer review" });
    expect(region).toHaveAttribute("dir", "ltr");
    expect(region).not.toHaveAttribute("dir", "auto");
  });

  it("sets dir=auto on essay answer text", () => {
    const essayAnswer = "الإجابة تحتوي على كلمة API و123";
    render(
      <AttemptAnswerReview
        review={{
          summary: { correct: 0, incorrect: 0, unanswered: 0 },
          questions: [
            {
              id: 9,
              type: "essay",
              result_status: "graded",
              question_text: "Explain",
              answer_text: essayAnswer,
              marks: 5,
              marks_earned: 3,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText(essayAnswer)).toHaveAttribute("dir", "auto");
  });
});
