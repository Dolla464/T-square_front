import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useExam } from "../useExam";
import { MCQ_AUTOSAVE_DEBOUNCE_MS } from "../examAnswerSaveConstants";

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

describe("useExam autosave debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    saveExamAnswer.mockResolvedValue({ data: { status: "saved" } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not save before debounce elapses", async () => {
    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    act(() => {
      result.current.scheduleAutosave(1, 5, "mcq");
    });

    await act(async () => {
      vi.advanceTimersByTime(MCQ_AUTOSAVE_DEBOUNCE_MS - 1);
    });

    expect(saveExamAnswer).not.toHaveBeenCalled();
  });

  it("saves after debounce and coalesces rapid changes", async () => {
    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    act(() => {
      result.current.scheduleAutosave(1, 5, "mcq");
      result.current.scheduleAutosave(1, 6, "mcq");
    });

    await act(async () => {
      vi.advanceTimersByTime(MCQ_AUTOSAVE_DEBOUNCE_MS);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(saveExamAnswer).toHaveBeenCalledTimes(1);
    expect(saveExamAnswer.mock.calls[0][0].choice_id).toBe(6);
  });

  it("flushAutosaves runs pending debounced save immediately", async () => {
    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    act(() => {
      result.current.scheduleAutosave(1, 5, "mcq");
    });

    await act(async () => {
      await result.current.flushAutosaves(10);
    });

    expect(saveExamAnswer).toHaveBeenCalledTimes(1);
    expect(saveExamAnswer.mock.calls[0][0].choice_id).toBe(5);
  });
});
