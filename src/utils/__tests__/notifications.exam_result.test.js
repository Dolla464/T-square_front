import { describe, expect, it } from "vitest";
import { getNotificationTarget } from "../notifications";

describe("exam_result notification routing", () => {
  it("routes student exam_result notifications to exam results page", () => {
    expect(
      getNotificationTarget(
        {
          type: "exam_result",
          course_id: 12,
          exam_id: 34,
        },
        "student",
      ),
    ).toBe("/student/exam-results");
  });
});
