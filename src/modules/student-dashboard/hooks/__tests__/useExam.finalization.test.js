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

const ongoingExamPayload = {
  attempt_id: 10,
  status: "ongoing",
  questions: [{ id: 1, type: "mcq", choices: [{ id: 5 }] }],
};

async function startOngoingExam(result) {
  startExamApi.mockResolvedValue({
    data: { data: ongoingExamPayload },
  });

  await act(async () => {
    await result.current.startExam();
  });
}

describe("useExam finalization and pending saves", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects waitForPendingSaves when a pending save for the attempt fails", async () => {
    const saveError = Object.assign(new Error("network"), {
      response: { status: 500 },
    });

    saveExamAnswer.mockRejectedValue(saveError);
    startExamApi.mockResolvedValue({
      data: { data: ongoingExamPayload },
    });

    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    let waitError;
    await act(async () => {
      const savePromise = result.current.saveAnswer(1, 5, "mcq");
      try {
        await result.current.waitForPendingSaves(10);
      } catch (err) {
        waitError = err;
      }
      await savePromise.catch(() => {});
    });

    expect(waitError).toBe(saveError);
    expect(submitExamApi).not.toHaveBeenCalled();
  });

  it("resolves waitForPendingSaves only after in-flight saves succeed", async () => {
    let resolveSave;
    saveExamAnswer.mockReturnValue(
      new Promise((resolve) => {
        resolveSave = () => resolve({ data: { status: "saved" } });
      }),
    );

    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    const order = [];

    await act(async () => {
      const savePromise = result.current.saveAnswer(1, 5, "mcq");
      const waitPromise = result.current
        .waitForPendingSaves(10)
        .then(() => order.push("wait-done"));
      savePromise.then(() => order.push("save-done"));
      resolveSave();
      await waitPromise;
    });

    expect(order).toEqual(["save-done", "wait-done"]);
  });

  it("blocks new saves during finalization unless bypassFinalizeLock is set", async () => {
    let releaseFinalize;
    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    const finalizeStarted = result.current.withAttemptFinalization(10, () =>
      new Promise((resolve) => {
        releaseFinalize = resolve;
      }),
    );

    let blockedError;
    await act(async () => {
      try {
        await result.current.saveAnswer(2, 6, "mcq");
      } catch (err) {
        blockedError = err;
      }
    });

    expect(blockedError?.code).toBe("SAVE_BLOCKED_DURING_FINALIZATION");

    saveExamAnswer.mockResolvedValue({ data: { status: "saved" } });
    await act(async () => {
      await result.current.saveAnswer(2, 6, "mcq", {
        bypassFinalizeLock: true,
      });
    });

    expect(saveExamAnswer).toHaveBeenCalledTimes(1);

    await act(async () => {
      releaseFinalize();
      await finalizeStarted;
    });
  });

  it("runs persist (bypass save) then submit exactly once inside finalization", async () => {
    const order = [];
    saveExamAnswer.mockImplementation(async () => {
      order.push("save");
      return { data: { status: "saved" } };
    });
    submitExamApi.mockImplementation(async () => {
      order.push("submit");
      return {
        data: {
          results: {
            score: 1,
            total_marks: 1,
            status: "passed",
            is_passed: true,
          },
        },
      };
    });

    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    await act(async () => {
      await result.current.withAttemptFinalization(10, async () => {
        await result.current.waitForPendingSaves(10);
        await result.current.saveAnswer(1, 5, "mcq", {
          bypassFinalizeLock: true,
        });
        await result.current.submitExam(10);
        return true;
      });
    });

    expect(order).toEqual(["save", "submit"]);
    expect(submitExamApi).toHaveBeenCalledTimes(1);
  });

  it("does not submit when persist fails during finalization prep", async () => {
    saveExamAnswer.mockRejectedValue(
      Object.assign(new Error("save failed"), { response: { status: 500 } }),
    );

    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    let ok = true;
    await act(async () => {
      ok = await result.current.withAttemptFinalization(10, async () => {
        await result.current.waitForPendingSaves(10);
        try {
          await result.current.saveAnswer(1, 5, "mcq", {
            bypassFinalizeLock: true,
          });
          return true;
        } catch {
          return false;
        }
      });
    });

    expect(ok).toBe(false);
    expect(submitExamApi).not.toHaveBeenCalled();
  });

  it("deduplicates concurrent withAttemptFinalization calls to one execution", async () => {
    let resolveSubmit;
    submitExamApi.mockReturnValue(
      new Promise((resolve) => {
        resolveSubmit = () =>
          resolve({
            data: {
              results: {
                score: 0,
                total_marks: 1,
                status: "failed",
                is_passed: false,
              },
            },
          });
      }),
    );

    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    let executionCount = 0;

    let first;
    let second;
    await act(async () => {
      first = result.current.withAttemptFinalization(10, async () => {
        executionCount += 1;
        await result.current.waitForPendingSaves(10);
        return result.current.submitExam(10);
      });
      second = result.current.withAttemptFinalization(10, async () => {
        executionCount += 1;
        return result.current.submitExam(10);
      });
    });

    expect(executionCount).toBe(1);
    expect(submitExamApi).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSubmit();
      await Promise.all([first, second]);
    });
  });

  it("releases the finalization lock after failure so save can retry", async () => {
    saveExamAnswer.mockRejectedValueOnce(
      Object.assign(new Error("save failed"), { response: { status: 500 } }),
    );
    saveExamAnswer.mockResolvedValueOnce({ data: { status: "saved" } });

    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    await act(async () => {
      const ok = await result.current.withAttemptFinalization(10, async () => {
        try {
          await result.current.waitForPendingSaves(10);
          await result.current.saveAnswer(1, 5, "mcq", {
            bypassFinalizeLock: true,
          });
          return true;
        } catch {
          return false;
        }
      });
      expect(ok).toBe(false);
    });

    await act(async () => {
      await result.current.saveAnswer(1, 5, "mcq");
    });

    expect(saveExamAnswer).toHaveBeenCalledTimes(2);
  });

  it("retries submit after first failure when persist succeeded and releases the finalization lock", async () => {
    saveExamAnswer.mockResolvedValue({ data: { status: "saved" } });
    const submitError = Object.assign(new Error("submit failed"), {
      response: { status: 500 },
    });
    submitExamApi
      .mockRejectedValueOnce(submitError)
      .mockResolvedValueOnce({
        data: {
          results: {
            score: 1,
            total_marks: 1,
            status: "passed",
            is_passed: true,
          },
        },
      });

    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    const finalizeBody = async () => {
      await result.current.waitForPendingSaves(10);
      await result.current.saveAnswer(1, 5, "mcq", {
        bypassFinalizeLock: true,
      });
      return result.current.submitExam(10);
    };

    await act(async () => {
      await expect(
        result.current.withAttemptFinalization(10, finalizeBody),
      ).rejects.toBe(submitError);
    });

    expect(submitExamApi).toHaveBeenCalledTimes(1);
    expect(saveExamAnswer).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.saveAnswer(2, 6, "mcq");
    });

    await act(async () => {
      const res = await result.current.withAttemptFinalization(10, finalizeBody);
      expect(res.results.status).toBe("passed");
    });

    expect(submitExamApi).toHaveBeenCalledTimes(2);
    expect(saveExamAnswer).toHaveBeenCalledTimes(3);
  });

  it("does not share one finalization promise across different attempt ids", async () => {
    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    let resolve10;
    let ran10 = false;
    let ran11 = false;

    await act(async () => {
      const flight10 = result.current.withAttemptFinalization(10, () =>
        new Promise((resolve) => {
          ran10 = true;
          resolve10 = () => resolve("ten");
        }),
      );

      const flight11 = result.current.withAttemptFinalization(11, async () => {
        ran11 = true;
        return "eleven";
      });

      expect(ran10).toBe(true);
      expect(ran11).toBe(false);

      resolve10();
      await flight10;
      await expect(flight11).resolves.toBe("eleven");
    });

    expect(ran11).toBe(true);
  });

  it("waitForPendingSaves ignores in-flight saves from a different attempt id", async () => {
    let resolveSave10;
    saveExamAnswer.mockReturnValue(
      new Promise((resolve) => {
        resolveSave10 = () => resolve({ data: { status: "saved" } });
      }),
    );

    const { result } = renderHook(() => useExam("1"));
    await startOngoingExam(result);

    await act(async () => {
      result.current.saveAnswer(1, 5, "mcq");
    });

    let waitCompleted = false;
    await act(async () => {
      await result.current.waitForPendingSaves(11);
      waitCompleted = true;
    });

    expect(waitCompleted).toBe(true);

    await act(async () => {
      resolveSave10();
    });
  });
});
