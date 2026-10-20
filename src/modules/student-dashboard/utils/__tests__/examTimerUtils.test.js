import { describe, expect, it } from "vitest";
import {
  calculateTimeLeft,
  getServerExpiryAction,
  hasUsableTimerInputs,
} from "../examTimerUtils";

describe("examTimerUtils", () => {
  it("does not treat missing timer inputs as usable", () => {
    expect(
      hasUsableTimerInputs({
        deadlineAt: null,
        startedAt: null,
        durationMins: NaN,
        remainingSeconds: undefined,
      }),
    ).toBe(false);
  });

  it("returns null time left when inputs are unusable", () => {
    expect(
      calculateTimeLeft({
        deadlineAt: null,
        startedAt: null,
        durationMins: 0,
        remainingSeconds: undefined,
      }),
    ).toBeNull();
  });

  it("classifies server ongoing vs expired vs closed", () => {
    expect(getServerExpiryAction(null)).toBe("unknown");
    expect(
      getServerExpiryAction({
        status: "ongoing",
        is_timed_out: false,
        remaining_seconds: 900,
      }),
    ).toBe("ongoing");
    expect(
      getServerExpiryAction({
        status: "ongoing",
        is_timed_out: true,
        remaining_seconds: 0,
      }),
    ).toBe("expired");
    expect(
      getServerExpiryAction({
        status: "failed",
        results: { score: 0 },
      }),
    ).toBe("closed_with_results");
  });

  it("uses deadline_at for countdown when client clock is ahead", () => {
    const nowMs = Date.parse("2026-01-01T10:20:00Z");
    const left = calculateTimeLeft({
      deadlineAt: "2026-01-01T10:10:00Z",
      startedAt: "2026-01-01T10:00:00Z",
      durationMins: 10,
      remainingSeconds: 600,
      nowMs,
    });
    expect(left).toBe(0);
  });
});
