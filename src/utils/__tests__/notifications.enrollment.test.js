import { describe, expect, it } from "vitest";
import {
  getNotificationTarget,
  resolveNotificationCopy,
} from "../notifications";

const t = (key, interpolation = {}) => {
  const map = {
    "notifications.types.enrollment_pending.title": "Enrollment Pending",
    "notifications.types.enrollment_pending.message":
      'Your enrollment request for "{{course}}" is pending approval and payment confirmation.',
    "notifications.types.enrollment_confirmed.title": "Enrollment Activated",
    "notifications.types.enrollment_confirmed.message":
      'You can now access "{{course}}" and start learning.',
  };

  let value = map[key] ?? key;
  if (interpolation.course !== undefined) {
    value = value.replace("{{course}}", interpolation.course);
  }

  return value;
};

describe("enrollment notification helpers", () => {
  it("resolves localized copy for enrollment_pending", () => {
    const copy = resolveNotificationCopy(
      {
        type: "enrollment_pending",
        course_title: "Laravel Basics",
        title: "Enrollment Pending",
        message: "fallback",
      },
      t,
    );

    expect(copy.title).toBe("Enrollment Pending");
    expect(copy.message).toContain("Laravel Basics");
  });

  it("routes enrollment notification types to the student course page", () => {
    const notification = {
      type: "enrollment_pending",
      course_id: 42,
    };

    expect(getNotificationTarget(notification, "student")).toBe(
      "/student/course/42",
    );

    expect(
      getNotificationTarget(
        { type: "enrollment_confirmed", course_id: 7 },
        "student",
      ),
    ).toBe("/student/course/7");
  });
});
