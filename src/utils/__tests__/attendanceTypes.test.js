import { describe, it, expect } from "vitest";
import {
  resolveCourseAttendanceTypes,
  shouldShowStudentAttendanceNav,
  getAttendanceTypeLabel,
  normalizeAttendanceType,
} from "../attendanceTypes";

describe("attendanceTypes utilities", () => {
  it("resolves current course attendance types from attendance_types array", () => {
    expect(
      resolveCourseAttendanceTypes({ attendance_types: ["online", "offline"] }),
    ).toEqual(["online", "offline"]);
  });

  it("hides attendance navigation when all enrollments are online", () => {
    expect(
      shouldShowStudentAttendanceNav([
        { enrollment: { attendance_type: "online" } },
        { enrollment: { attendance_type: "online" } },
      ]),
    ).toBe(false);
  });

  it("shows attendance navigation when any enrollment is offline, hybrid, or null", () => {
    expect(
      shouldShowStudentAttendanceNav([
        { enrollment: { attendance_type: "online" } },
        { enrollment: { attendance_type: "offline" } },
      ]),
    ).toBe(true);

    expect(
      shouldShowStudentAttendanceNav([
        { enrollment: { attendance_type: "online" } },
        { enrollment: { attendance_type: null } },
      ]),
    ).toBe(true);
  });

  it("preserves safest behavior when enrollment data is unavailable", () => {
    expect(shouldShowStudentAttendanceNav([])).toBe(true);
    expect(shouldShowStudentAttendanceNav(null)).toBe(true);
  });

  it("labels enrollment attendance type separately from course types", () => {
    const t = (key, options) => options?.defaultValue ?? key;

    expect(getAttendanceTypeLabel("online", t)).toBe("online");
    expect(getAttendanceTypeLabel(null, t)).toBe("Not assigned");
    expect(normalizeAttendanceType(" Hybrid ")).toBe("hybrid");
  });
});
