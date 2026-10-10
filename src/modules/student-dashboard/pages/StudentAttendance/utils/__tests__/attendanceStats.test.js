import { describe, it, expect } from "vitest";
import {
  computeOverallAttendanceStats,
  pickDefaultSession,
} from "../attendanceStats";

describe("attendanceStats utilities", () => {
  it("computes overall attendance stats from summary groups", () => {
    expect(
      computeOverallAttendanceStats([
        { attended_sessions: 8, total_sessions: 10 },
        { attended_sessions: 2, total_sessions: 5 },
      ]),
    ).toEqual({ pct: 67, present: 10, absent: 5, total: 15 });
  });

  it("prefers qr-available session when picking default session", () => {
    const sessions = [
      { session_id: 1, status: "upcoming" },
      { session_id: 2, status: "active", qr_available: false },
      { session_id: 3, status: "upcoming", qr_available: true },
    ];

    expect(pickDefaultSession(sessions)?.session_id).toBe(3);
  });

  it("falls back to active then upcoming sessions", () => {
    const sessions = [
      { session_id: 1, status: "completed", qr_available: false },
      { session_id: 2, status: "upcoming", qr_available: false },
      { session_id: 3, status: "active", qr_available: false },
    ];

    expect(pickDefaultSession(sessions)?.session_id).toBe(3);
  });
});
