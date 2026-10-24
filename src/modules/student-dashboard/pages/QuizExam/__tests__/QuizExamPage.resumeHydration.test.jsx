import { describe, expect, it } from "vitest";
import { mergeExamAnswersForResume, QUIZ_SESSION_VERSION } from "../../../utils/quizExamSessionState";

describe("QuizExamPage resume hydration (server baseline)", () => {
  it("after successful autosave, server user_answers win over clean session", () => {
    const apiAfterSave = { 7: 101 };

    const result = mergeExamAnswersForResume({
      apiAnswers: apiAfterSave,
      session: {
        v: QUIZ_SESSION_VERSION,
        attemptId: 42,
        savedIndex: 0,
        drafts: {},
      },
      attemptId: 42,
    });

    expect(result.answers).toEqual({ 7: 101 });
  });

  it("does not apply stale legacy savedAnswers over server", () => {
    const result = mergeExamAnswersForResume({
      apiAnswers: { 7: 101 },
      session: {
        attemptId: 42,
        savedIndex: 2,
        savedAnswers: { 7: 102 },
      },
      attemptId: 42,
    });

    expect(result.answers).toEqual({ 7: 101 });
    expect(result.savedIndex).toBe(2);
  });
});
