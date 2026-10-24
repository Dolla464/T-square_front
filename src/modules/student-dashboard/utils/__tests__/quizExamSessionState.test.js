import { describe, expect, it } from "vitest";
import {
  mergeExamAnswersForResume,
  QUIZ_SESSION_VERSION,
} from "../quizExamSessionState";

describe("mergeExamAnswersForResume", () => {
  it("uses API answers when session attempt differs", () => {
    const result = mergeExamAnswersForResume({
      apiAnswers: { 1: 10 },
      session: { v: 2, attemptId: 99, savedIndex: 2, drafts: { 1: { value: 20, dirty: true } } },
      attemptId: 42,
    });

    expect(result.answers).toEqual({ 1: 10 });
    expect(result.savedIndex).toBe(0);
  });

  it("overlays dirty draft for same attempt", () => {
    const result = mergeExamAnswersForResume({
      apiAnswers: { 7: 100 },
      session: {
        v: QUIZ_SESSION_VERSION,
        attemptId: 42,
        savedIndex: 1,
        drafts: {
          7: { value: 101, revision: 2, dirty: true },
        },
      },
      attemptId: 42,
    });

    expect(result.answers).toEqual({ 7: 101 });
    expect(result.savedIndex).toBe(1);
  });

  it("ignores clean or legacy savedAnswers blobs", () => {
    const legacy = mergeExamAnswersForResume({
      apiAnswers: { 7: 100 },
      session: {
        attemptId: 42,
        savedIndex: 3,
        savedAnswers: { 7: 999 },
      },
      attemptId: 42,
    });

    expect(legacy.answers).toEqual({ 7: 100 });
    expect(legacy.savedIndex).toBe(3);

    const cleanDraft = mergeExamAnswersForResume({
      apiAnswers: { 7: 100 },
      session: {
        v: QUIZ_SESSION_VERSION,
        attemptId: 42,
        savedIndex: 0,
        drafts: { 7: { value: 999, dirty: false } },
      },
      attemptId: 42,
    });

    expect(cleanDraft.answers).toEqual({ 7: 100 });
  });
});
