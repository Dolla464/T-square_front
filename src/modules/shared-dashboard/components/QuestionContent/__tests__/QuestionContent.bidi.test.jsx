import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import QuestionContent from "../QuestionContent";

describe("QuestionContent bidi (dir=auto on question text)", () => {
  it("sets dir=auto on question-content-text for Arabic-only text", () => {
    const text = "مرحبا بكم في الاختبار";
    render(<QuestionContent question={{ question_text: text }} />);

    const paragraph = screen.getByText(text);
    expect(paragraph).toHaveClass("question-content-text");
    expect(paragraph).toHaveAttribute("dir", "auto");
  });

  it("sets dir=auto for Arabic + English + numbers", () => {
    const text = "اختر الإجابة الصحيحة للسؤال رقم 10 من A إلى D.";
    render(<QuestionContent question={{ question_text: text }} />);

    expect(screen.getByText(text)).toHaveAttribute("dir", "auto");
  });

  it("sets dir=auto for English-only text", () => {
    const text = "Which option is correct?";
    render(<QuestionContent question={{ question_text: text }} />);

    expect(screen.getByText(text)).toHaveAttribute("dir", "auto");
  });

  it("uses Arabic question mark for Arabic text stored with Latin ?", () => {
    render(
      <QuestionContent question={{ question_text: "ما هو الاختيار الصحيح?" }} />,
    );

    expect(screen.getByText("ما هو الاختيار الصحيح؟")).toBeInTheDocument();
  });

  it("keeps Latin ? for English-only questions", () => {
    const text = "Which option is correct?";
    render(<QuestionContent question={{ question_text: text }} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("does not set dir=auto on question-content wrapper or code pre", () => {
    const code = 'console.log("hello");';
    render(
      <QuestionContent
        question={{
          question_text: "Explain the output:",
          question_code: code,
        }}
      />,
    );

    const wrapper = screen.getByText("Explain the output:").closest(".question-content");
    expect(wrapper).not.toHaveAttribute("dir", "auto");

    const pre = document.querySelector(".question-code-pre");
    expect(pre).toBeTruthy();
    expect(pre).not.toHaveAttribute("dir", "auto");
  });
});
