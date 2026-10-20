import { describe, expect, it, vi } from "vitest";
import { getServerExpiryAction } from "../../../utils/examTimerUtils";

/**
 * Mirrors QuizExamPage reconcileServerTimeStatus decision table (read-only spec).
 */
describe("exam expiry reconciliation", () => {
  it("does not treat unknown time-status as expired", () => {
    expect(getServerExpiryAction(null)).toBe("unknown");
    expect(getServerExpiryAction(undefined)).toBe("unknown");
  });

  it("treats server ongoing status as not expired", () => {
    expect(
      getServerExpiryAction({
        status: "ongoing",
        is_timed_out: false,
        remaining_seconds: 1180,
      }),
    ).toBe("ongoing");
  });

  it("treats server-confirmed expiry as expired", () => {
    expect(
      getServerExpiryAction({
        status: "ongoing",
        is_timed_out: true,
        remaining_seconds: 0,
      }),
    ).toBe("expired");
  });

  it("uses closed results without requiring client submit", () => {
    const action = getServerExpiryAction({
      status: "failed",
      results: { score: 0, status: "failed" },
    });
    expect(action).toBe("closed_with_results");
  });
});
