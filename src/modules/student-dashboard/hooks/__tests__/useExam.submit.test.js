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

import {
  saveExamAnswer,
  startExam as startExamApi,
  submitExam as submitExamApi,
} from "../../services/dashboardService";

describe("useExam submit and save coordination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deduplicates concurrent submitExam calls", async () => {
    let resolveSubmit;
    submitExamApi.mockReturnValue(
      new Promise((resolve) => {
        resolveSubmit = () =>
          resolve({
            data: {
              results: {
                score: 0,
                total_marks: 15,
                status: "failed",
                is_passed: false,
              },
            },
          });
      }),
    );

    const { result } = renderHook(() => useExam("1"));

    let first;
    let second;
    await act(async () => {
      first = result.current.submitExam(99);
      second = result.current.submitExam(99);
    });

    expect(submitExamApi).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSubmit();
      await Promise.all([first, second]);
    });
  });

  it("waitForPendingSaves awaits in-flight save promises", async () => {
    let resolveSave;
    saveExamAnswer.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = () => resolve({ data: { status: "saved" } });
      }),
    );

    startExamApi.mockResolvedValue({
      data: {
        data: {
          attempt_id: 10,
          status: "ongoing",
          questions: [{ id: 1, type: "mcq", choices: [{ id: 5 }] }],
        },
      },
    });

    const { result } = renderHook(() => useExam("1"));

    await act(async () => {
      await result.current.startExam();
    });

    await act(async () => {
      const savePromise = result.current.saveAnswer(1, 5, "mcq");
      const waitPromise = result.current.waitForPendingSaves(10);
      resolveSave();
      await Promise.all([savePromise, waitPromise]);
    });

    expect(saveExamAnswer).toHaveBeenCalledTimes(1);
  });
});
