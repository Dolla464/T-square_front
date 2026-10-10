import { describe, it, expect } from "vitest";
import {
  canCheckInToday,
  getTodayHeroMessageKey,
  isAttended,
  isFinalizedAbsent,
} from "../todaySessionState";

describe("todaySessionState utilities", () => {
  it("allows check-in when qr is available and student is not marked present", () => {
    expect(
      canCheckInToday({
        status: "active",
        qr_available: true,
        student_status: "not_marked",
      }),
    ).toBe(true);
  });

  it("allows check-in when student has placeholder absent record during active session", () => {
    expect(
      canCheckInToday({
        status: "active",
        qr_available: true,
        student_status: "absent",
      }),
    ).toBe(true);
  });

  it("blocks check-in for completed lifecycle sessions", () => {
    expect(
      canCheckInToday({
        status: "completed",
        qr_available: false,
        student_status: "absent",
      }),
    ).toBe(false);
  });

  it("treats completed sessions without records as finalized absent", () => {
    const session = {
      status: "completed",
      student_status: "absent",
      qr_available: false,
    };

    expect(isFinalizedAbsent(session)).toBe(true);
    expect(getTodayHeroMessageKey(session)).toBe("attendance.sessionEndedAbsent");
  });

  it("returns attended hero message for present students", () => {
    expect(
      getTodayHeroMessageKey({
        status: "completed",
        student_status: "present",
      }),
    ).toBe("attendance.alreadyMarked");
    expect(
      isAttended({
        student_status: "late",
      }),
    ).toBe(true);
  });

  it("returns upcoming message before qr window opens", () => {
    expect(
      getTodayHeroMessageKey({
        status: "upcoming",
        student_status: "not_marked",
        qr_available: false,
      }),
    ).toBe("attendance.sessionUpcoming");
  });
});
