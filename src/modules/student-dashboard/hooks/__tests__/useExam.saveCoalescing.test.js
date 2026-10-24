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

const ongoingExamPayload = {
  attempt_id: 10,
  status: "ongoing",
  questions: [{ id: 1, type: "mcq", choices: [{ id: 5 }, { id: 6 }] }],
};

async function startOngoingExam(result) {
  startExamApi.mockResolvedValue({
    data: { data: ongoingExamPayload },
  });

  await act(async () => {
    await result.current.startExam();
  });
}

describe("useExam save coalescing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists B after A completes when answer changes during in-flight A", async () => {
    let resolveFirst;
    saveExamAnswer
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = () => resolve({ data: { status: "saved" } });
          }),
      )
      .mockResolvedValueOnce({ data: { status: "saved" } });

    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    let flight;
    await act(async () => {
      flight = result.current.saveAnswer(1, 5, "mcq");
      result.current.saveAnswer(1, 6, "mcq");
    });

    await act(async () => {
      resolveFirst();
      await flight;
    });

    expect(saveExamAnswer).toHaveBeenCalledTimes(2);
    expect(saveExamAnswer.mock.calls[0][0].choice_id).toBe(5);
    expect(saveExamAnswer.mock.calls[1][0].choice_id).toBe(6);
  });

  it("never finishes with A or B when C is the latest during rapid edits", async () => {
    let resolveFirst;
    saveExamAnswer
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = () => resolve({ data: { status: "saved" } });
          }),
      )
      .mockResolvedValue({ data: { status: "saved" } });

    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    await act(async () => {
      const p = result.current.saveAnswer(1, 5, "mcq");
      result.current.saveAnswer(1, 6, "mcq");
      result.current.saveAnswer(1, 7, "mcq");
      resolveFirst();
      await p;
    });

    const choiceIds = saveExamAnswer.mock.calls.map((c) => c[0].choice_id);
    expect(choiceIds[choiceIds.length - 1]).toBe(7);
    expect(choiceIds).not.toContain(undefined);
  });
});
