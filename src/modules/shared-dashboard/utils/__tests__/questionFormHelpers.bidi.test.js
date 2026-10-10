import { describe, expect, it } from "vitest";
import {
  formatQuestionTextForPayload,
  normalizeQuestionTextForDisplay,
} from "../questionFormHelpers";

describe("question text punctuation (bidi)", () => {
  it("appends Arabic ؟ on save when text contains Arabic", () => {
    expect(formatQuestionTextForPayload("ما هو الاختيار الصحيح")).toBe(
      "ما هو الاختيار الصحيح؟",
    );
  });

  it("appends Latin ? on save for English-only text", () => {
    expect(formatQuestionTextForPayload("Which is correct")).toBe(
      "Which is correct?",
    );
  });

  it("normalizes trailing Latin ? to ؟ for display when Arabic present", () => {
    expect(normalizeQuestionTextForDisplay("السؤال?")).toBe("السؤال؟");
  });
});
