import { describe, it, expect } from "vitest";
import {
  canEnableEnrollmentCompletion,
  getCompletionBlockReason,
} from "../enrollmentCompletion";

describe("canEnableEnrollmentCompletion", () => {
  it("allows online enrollment completion without a learning group", () => {
    expect(canEnableEnrollmentCompletion("online", null, null)).toBe(true);
  });

  it("requires a completed group for offline enrollments", () => {
    expect(canEnableEnrollmentCompletion("offline", null, null)).toBe(false);
    expect(canEnableEnrollmentCompletion("offline", 1, "active")).toBe(false);
    expect(canEnableEnrollmentCompletion("offline", 1, "completed")).toBe(true);
  });

  it("requires a completed group for hybrid enrollments", () => {
    expect(canEnableEnrollmentCompletion("hybrid", null, null)).toBe(false);
    expect(canEnableEnrollmentCompletion("hybrid", 1, "completed")).toBe(true);
  });

  it("keeps null attendance type group-dependent", () => {
    expect(canEnableEnrollmentCompletion(null, null, null)).toBe(false);
    expect(canEnableEnrollmentCompletion(null, 1, "completed")).toBe(true);
  });
});

describe("getCompletionBlockReason", () => {
  const t = (key) => key;

  it("does not show a group-required hint for online enrollments without a group", () => {
    expect(
      getCompletionBlockReason(
        { attendance_type: "online", group_id: null, is_completed: false },
        t,
      ),
    ).toBeNull();
  });

  it("shows group-required hint for offline enrollments without a group", () => {
    expect(
      getCompletionBlockReason(
        { attendance_type: "offline", group_id: null, is_completed: false },
        t,
      ),
    ).toBe("students_page.completion_requires_group");
  });
});
