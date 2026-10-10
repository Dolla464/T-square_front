import { describe, expect, it } from "vitest";
import { getNotificationTarget } from "../notifications";

describe("attendance notification targets", () => {
  it("routes session notifications to attendance with session query", () => {
    expect(
      getNotificationTarget(
        { type: "session_activated", session_id: 55 },
        "student",
      ),
    ).toBe("/student/attendance?session=55");
  });

  it("falls back to attendance landing when session id is missing", () => {
    expect(
      getNotificationTarget({ type: "session_cancelled" }, "student"),
    ).toBe("/student/attendance");
  });
});
