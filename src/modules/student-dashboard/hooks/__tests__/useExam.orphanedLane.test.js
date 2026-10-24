import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useExam } from "../useExam";

vi.mock("../../services/dashboardService", () => ({
  startExam: vi.fn(),
  saveExamAnswer: vi.fn(),
  submitExam: vi.fn(),
  getAttemptReview: vi.fn(),
  getExamTimeStatus: vi.fn(),
}));

vi.mock("../../../components/shared/Toaster/toaster", () => ({
  toastCustom: vi.fn(),
}));

vi.mock("../../utils/examJourneyLog", () => ({
  bindExamJourneyAttempt: vi.fn(),
  clearExamJourneyAttempt: vi.fn(),
  flushExamJourneyEvents: vi.fn(),
  trackExamJourneyEvent: vi.fn(),
}));

vi.mock("../../utils/examTimerDiagnostic", () => ({
  logStartResponse: vi.fn(),
  logTimeStatusResponse: vi.fn(),
}));

import { saveExamAnswer, startExam as startExamApi } from "../../services/dashboardService";
import { ANSWER_SAVE_STATUS } from "../examAnswerSaveConstants";

const examAttempt10 = {
  attempt_id: 10,
  status: "ongoing",
  questions: [{ id: 1, type: "mcq", choices: [{ id: 5 }, { id: 6 }] }],
};

const examAttempt11 = {
  attempt_id: 11,
  status: "ongoing",
  questions: [{ id: 1, type: "mcq", choices: [{ id: 5 }, { id: 6 }] }],
};

describe("useExam orphaned save lane", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not apply attempt A lane completion to attempt B save state", async () => {
    let resolveAttemptASave;
    saveExamAnswer.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveAttemptASave = () => resolve({ data: { status: "saved" } });
        }),
    );
    saveExamAnswer.mockResolvedValue({ data: { status: "saved" } });

    startExamApi
      .mockResolvedValueOnce({ data: { data: examAttempt10 } })
      .mockResolvedValueOnce({ data: { data: examAttempt11 } });

    const { result } = renderHook(() => useExam("1"));

    await act(async () => {
      await result.current.startExam();
    });

    let saveFlight;
    await act(async () => {
      saveFlight = result.current.saveAnswer(1, 5, "mcq");
    });

    await act(async () => {
      await result.current.startExam();
    });

    expect(result.current.exam?.attempt_id).toBe(11);
    expect(result.current.answerSaveByQuestion).toEqual({});

    await act(async () => {
      resolveAttemptASave();
      await saveFlight.catch(() => {});
    });

    expect(result.current.answerSaveByQuestion[1]).toBeUndefined();

    await act(async () => {
      await result.current.saveAnswer(1, 6, "mcq");
    });

    expect(result.current.answerSaveByQuestion[1]?.status).toBe(
      ANSWER_SAVE_STATUS.SAVED,
    );
    expect(saveExamAnswer.mock.calls.at(-1)[0].attempt_id).toBe(11);
  });
});
