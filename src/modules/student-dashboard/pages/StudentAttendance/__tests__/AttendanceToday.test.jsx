import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AttendanceToday from "../AttendanceToday";

const mockUseAttendanceToday = vi.fn();

vi.mock("../../../hooks/useAttendanceToday", () => ({
  useAttendanceToday: () => mockUseAttendanceToday(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en" },
  }),
}));

describe("AttendanceToday", () => {
  beforeEach(() => {
    mockUseAttendanceToday.mockReturnValue({
      todaySessions: [
        {
          session_id: 1,
          course_title: "Course A",
          group_name: "Group 1",
          start_time: "10:00",
          end_time: "12:00",
          room: "101",
          status: "active",
          student_status: "not_marked",
          qr_available: true,
        },
      ],
      activeSession: {
        session_id: 1,
        course_title: "Course A",
        group_name: "Group 1",
        start_time: "10:00",
        end_time: "12:00",
        room: "101",
        status: "active",
        student_status: "not_marked",
        qr_available: true,
      },
      qrCode: null,
      qrExpiresAt: null,
      loading: false,
      qrLoading: false,
      checkInLoading: false,
      checkInSuccess: false,
      checkInError: null,
      loadToday: vi.fn(),
      loadQrCode: vi.fn(),
      handleCheckIn: vi.fn(),
      resetCheckIn: vi.fn(),
      selectSession: vi.fn(),
    });
  });

  it("renders hero session and check-in action", () => {
    render(
      <MemoryRouter>
        <AttendanceToday />
      </MemoryRouter>,
    );

    expect(screen.getByText("Course A")).toBeInTheDocument();
    expect(screen.getByText("attendance.checkInNow")).toBeInTheDocument();
    expect(screen.getByText("attendance.viewMyRecord")).toBeInTheDocument();
  });

  it("shows absent finalized state for completed sessions", () => {
    mockUseAttendanceToday.mockReturnValue({
      todaySessions: [
        {
          session_id: 2,
          course_title: "Course B",
          group_name: "Group 2",
          start_time: "10:00",
          end_time: "12:00",
          status: "completed",
          student_status: "absent",
          qr_available: false,
        },
      ],
      activeSession: {
        session_id: 2,
        course_title: "Course B",
        group_name: "Group 2",
        start_time: "10:00",
        end_time: "12:00",
        status: "completed",
        student_status: "absent",
        qr_available: false,
      },
      qrCode: null,
      qrExpiresAt: null,
      loading: false,
      qrLoading: false,
      checkInLoading: false,
      checkInSuccess: false,
      checkInError: null,
      loadToday: vi.fn(),
      loadQrCode: vi.fn(),
      handleCheckIn: vi.fn(),
      resetCheckIn: vi.fn(),
      selectSession: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AttendanceToday />
      </MemoryRouter>,
    );

    expect(screen.getByText("attendance.sessionEndedAbsent")).toBeInTheDocument();
    expect(screen.queryByText("attendance.checkInNow")).not.toBeInTheDocument();
  });
});
