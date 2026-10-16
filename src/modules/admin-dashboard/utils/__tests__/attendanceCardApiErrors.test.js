import { describe, it, expect } from "vitest";
import {
  extractInactiveWarning,
  getAttendanceCardErrorMessage,
} from "../attendanceCardApiErrors";

const t = (key) => key;

describe("attendanceCardApiErrors", () => {
  it("maps CARD_ALREADY_ACTIVE and NO_ACTIVE_CARD codes", () => {
    expect(
      getAttendanceCardErrorMessage(
        { response: { status: 422, data: { code: "CARD_ALREADY_ACTIVE" } } },
        t,
      ),
    ).toBe("students_page.attendance_card.errors.card_already_active");

    expect(
      getAttendanceCardErrorMessage(
        { response: { status: 422, data: { code: "NO_ACTIVE_CARD" } } },
        t,
      ),
    ).toBe("students_page.attendance_card.errors.no_active_card");
  });

  it("maps 401 404 and 409 statuses", () => {
    expect(
      getAttendanceCardErrorMessage({ response: { status: 401, data: { code: "SESSION_EXPIRED" } } }, t),
    ).toBe("students_page.attendance_card.errors.session_expired");

    expect(
      getAttendanceCardErrorMessage({ response: { status: 404, data: { code: "NOT_FOUND" } } }, t),
    ).toBe("students_page.attendance_card.errors.not_found");

    expect(
      getAttendanceCardErrorMessage(
        { response: { status: 409, data: { message: "Unverified" } } },
        t,
      ),
    ).toBe("students_page.attendance_card.errors.email_unverified");
  });

  it("maps 403 429 and 500 statuses", () => {
    expect(
      getAttendanceCardErrorMessage(
        { response: { status: 403, data: { code: "FORBIDDEN" } } },
        t,
      ),
    ).toBe("students_page.attendance_card.errors.forbidden");

    expect(
      getAttendanceCardErrorMessage({ response: { status: 429, data: {} } }, t),
    ).toBe("students_page.attendance_card.errors.rate_limit");

    expect(
      getAttendanceCardErrorMessage({ response: { status: 500, data: {} } }, t),
    ).toBe("students_page.attendance_card.errors.server");
  });

  it("extracts STUDENT_INACTIVE warning", () => {
    const warning = extractInactiveWarning([
      { code: "OTHER" },
      { code: "STUDENT_INACTIVE", message: "Blocked" },
    ]);
    expect(warning?.message).toBe("Blocked");
  });
});
