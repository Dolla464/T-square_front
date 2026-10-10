import { describe, it, expect } from "vitest";
import {
  mapItemToFormData,
  defaultFormData,
  buildFormData,
  normalizeAttendanceTypes,
  validateAttendanceTypes,
} from "../courseHelpers";

describe("courseHelpers attendance types", () => {
  it("mapItemToFormData reads attendance_types[]", () => {
    const result = mapItemToFormData({
      title: "Course",
      attendance_types: ["online", "offline"],
    });

    expect(result.attendance_types).toEqual(["online", "offline"]);
  });

  it("default form contains attendance_types", () => {
    expect(defaultFormData.attendance_types).toEqual(["online"]);
  });

  it("buildFormData sends attendance_types[] in course payload", () => {
    const fd = buildFormData({
      title: "Course",
      attendance_types: ["online", "hybrid"],
    });

    expect(fd.get("attendance_types[0]")).toBe("online");
    expect(fd.get("attendance_types[1]")).toBe("hybrid");
    expect(fd.get("attendance_type")).toBeNull();
  });

  it("preserves multiple attendance types through form mapping", () => {
    const result = mapItemToFormData({
      attendance_types: ["online", "offline", "hybrid"],
    });

    expect(result.attendance_types).toEqual(["online", "offline", "hybrid"]);
  });

  it("validateAttendanceTypes rejects empty arrays", () => {
    expect(validateAttendanceTypes([])).toBe("attendance_types_required");
  });

  it("validateAttendanceTypes rejects unsupported values", () => {
    expect(validateAttendanceTypes(["online", "invalid"])).toBe("attendance_types_invalid");
  });

  it("normalizeAttendanceTypes deduplicates values", () => {
    expect(normalizeAttendanceTypes(["online", "online", "offline"])).toEqual([
      "online",
      "offline",
    ]);
  });
});
