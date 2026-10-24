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
  startExam as startExamApi,
  getExamTimeStatus,
} from "../../services/dashboardService";

const examPayloadA = {
  attempt_id: 100,
  status: "ongoing",
  questions: [{ id: 1, type: "mcq", choices: [{ id: 5 }] }],
};

const examPayloadB = {
  attempt_id: 200,
  status: "ongoing",
  questions: [{ id: 2, type: "mcq", choices: [{ id: 6 }] }],
};

describe("useExam stale startExam responses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not apply quiz A response after switching to quiz B", async () => {
    let resolveA;
    startExamApi.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveA = () =>
            resolve({ data: { data: examPayloadA } });
        }),
    );
    startExamApi.mockImplementationOnce(() =>
      Promise.resolve({ data: { data: examPayloadB } }),
    );

    const { result, rerender } = renderHook(({ id }) => useExam(id), {
      initialProps: { id: "1" },
    });

    let startA;
    await act(async () => {
      startA = result.current.startExam();
    });

    rerender({ id: "2" });

    await act(async () => {
      await result.current.startExam();
    });

    expect(result.current.exam?.attempt_id).toBe(200);

    await act(async () => {
      resolveA();
      await startA;
    });

    expect(result.current.exam?.attempt_id).toBe(200);
    expect(result.current.exam?.questions?.[0]?.id).toBe(2);
  });

  it("keeps the newer start result when two requests resolve out of order", async () => {
    let resolveFirst;
    let resolveSecond;
    startExamApi
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = () =>
              resolve({
                data: {
                  data: {
                    ...examPayloadA,
                    attempt_id: 101,
                  },
                },
              });
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = () =>
              resolve({
                data: {
                  data: {
                    ...examPayloadA,
                    attempt_id: 102,
                  },
                },
              });
          }),
      );

    const { result } = renderHook(() => useExam("1"));

    let firstFlight;
    let secondFlight;
    await act(async () => {
      firstFlight = result.current.startExam();
      secondFlight = result.current.startExam();
    });

    await act(async () => {
      resolveSecond();
      await secondFlight;
    });

    expect(result.current.exam?.attempt_id).toBe(102);

    await act(async () => {
      resolveFirst();
      await firstFlight;
    });

    expect(result.current.exam?.attempt_id).toBe(102);
  });

  it("does not apply a stale rejection after a newer start succeeds", async () => {
    const staleError = Object.assign(new Error("stale fail"), {
      response: { status: 500 },
    });
    let rejectFirst;
    startExamApi
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectFirst = () => reject(staleError);
          }),
      )
      .mockResolvedValueOnce({
        data: { data: { ...examPayloadA, attempt_id: 103 } },
      });

    const { result } = renderHook(() => useExam("1"));

    let firstFlight;
    await act(async () => {
      firstFlight = result.current.startExam();
      await result.current.startExam();
    });

    expect(result.current.exam?.attempt_id).toBe(103);
    expect(result.current.error).toBeNull();

    await act(async () => {
      rejectFirst();
      await firstFlight.catch(() => {});
    });

    expect(result.current.exam?.attempt_id).toBe(103);
    expect(result.current.error).toBeNull();
  });

  it("does not clear loading from an older request while a newer one is in flight", async () => {
    let resolveFirst;
    let resolveSecond;
    startExamApi
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = () =>
              resolve({ data: { data: { ...examPayloadA, attempt_id: 104 } } });
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = () =>
              resolve({ data: { data: { ...examPayloadA, attempt_id: 105 } } });
          }),
      );

    const { result } = renderHook(() => useExam("1"));

    let firstFlight;
    let secondFlight;
    await act(async () => {
      firstFlight = result.current.startExam();
      secondFlight = result.current.startExam();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFirst();
      await firstFlight;
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveSecond();
      await secondFlight;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.exam?.attempt_id).toBe(105);
  });
});

describe("useExam syncExamTime stale attempt guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not merge time status for a different attempt", async () => {
    startExamApi.mockResolvedValue({
      data: { data: { ...examPayloadB, attempt_id: 200 } },
    });

    const { result } = renderHook(() => useExam("1"));

    await act(async () => {
      await result.current.startExam();
    });

    getExamTimeStatus.mockResolvedValue({
      data: {
        data: {
          attempt_id: 999,
          remaining_seconds: 10,
          status: "ongoing",
        },
      },
    });

    await act(async () => {
      await result.current.syncExamTime(999);
    });

    expect(result.current.exam?.attempt_id).toBe(200);
    expect(result.current.exam?.remaining_seconds).toBeUndefined();
  });

  it("merges time status when attempt id matches", async () => {
    startExamApi.mockResolvedValue({
      data: {
        data: {
          ...examPayloadB,
          attempt_id: 200,
          remaining_seconds: 500,
        },
      },
    });

    const { result } = renderHook(() => useExam("1"));

    await act(async () => {
      await result.current.startExam();
    });

    getExamTimeStatus.mockResolvedValue({
      data: {
        data: {
          attempt_id: 200,
          remaining_seconds: 475,
          status: "ongoing",
        },
      },
    });

    await act(async () => {
      await result.current.syncExamTime(200);
    });

    expect(result.current.exam?.remaining_seconds).toBe(475);
  });
});
