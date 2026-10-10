import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AdminSchedule from "../AdminSchedule";

let mockLanguage = "en";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key) => {
        const en = {
          "schedule_page.title": "Center Daily Schedule",
          "schedule_page.subtitle": "View, filter, edit and cancel sessions across all groups.",
          "schedule_page.subtitle_readonly": "View and filter sessions across all groups.",
          "schedule_page.view_day": "Day",
          "schedule_page.view_week": "Week",
          "schedule_page.view_month": "Month",
          "schedule_page.filter_date": "Date",
          "schedule_page.filter_all_instructors": "All Instructors",
          "schedule_page.filter_all_statuses": "All Statuses",
          "schedule_page.filter_reset": "Reset",
          "schedule_page.loading": "Loading schedule…",
          "schedule_page.empty_title": "No sessions found",
          "schedule_page.empty_hint": "Try a different date or instructor filter.",
        };
        const ar = {
          "schedule_page.title": "جدول المركز اليومي",
          "schedule_page.subtitle": "عرض وتصفية وتعديل وإلغاء الجلسات لجميع المجموعات.",
          "schedule_page.subtitle_readonly": "عرض وتصفية الجلسات لجميع المجموعات.",
          "schedule_page.view_day": "يوم",
          "schedule_page.view_week": "أسبوع",
          "schedule_page.view_month": "شهر",
          "schedule_page.filter_date": "التاريخ",
          "schedule_page.filter_all_instructors": "كل المحاضرين",
          "schedule_page.filter_all_statuses": "كل الحالات",
          "schedule_page.filter_reset": "إعادة ضبط",
          "schedule_page.loading": "جاري تحميل الجدول…",
          "schedule_page.empty_title": "لا توجد جلسات",
          "schedule_page.empty_hint": "جرّب تاريخاً أو محاضراً مختلفاً.",
        };
        const dict = mockLanguage.startsWith("ar") ? ar : en;
        return dict[key] ?? key;
      },
      i18n: { language: mockLanguage },
    }),
  };
});

const mockUseSchedule = () => ({
  sessions: [],
  pagination: null,
  loading: false,
  error: null,
  instructors: [],
  instructorsLoading: false,
  filters: {
    date: "2026-10-04",
    instructor_id: "",
    status: "",
    per_page: 15,
  },
  viewMode: "day",
  weekBounds: { from: "2026-09-27", to: "2026-10-03" },
  monthBounds: { from: "2026-10-01", to: "2026-10-31" },
  updateFilter: vi.fn(),
  handleDateChange: vi.fn(),
  setViewMode: vi.fn(),
  resetFilters: vi.fn(),
  handlePageChange: vi.fn(),
  rescheduleModal: { show: false, session: null },
  openRescheduleModal: vi.fn(),
  closeRescheduleModal: vi.fn(),
  cancelModal: { show: false, session: null },
  openCancelModal: vi.fn(),
  closeCancelModal: vi.fn(),
  handleReschedule: vi.fn(),
  handleCancel: vi.fn(),
  handleExport: vi.fn(),
  actionLoading: false,
});

describe("AdminSchedule locale UI", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it("renders English static labels", () => {
    render(<AdminSchedule useScheduleHook={mockUseSchedule} />);

    expect(screen.getByText("Center Daily Schedule")).toBeInTheDocument();
    expect(screen.getByText("Day")).toBeInTheDocument();
    expect(screen.getByText("All Instructors")).toBeInTheDocument();
    expect(screen.getByText("No sessions found")).toBeInTheDocument();
  });

  it("renders Arabic static labels when locale is ar", () => {
    mockLanguage = "ar";

    render(<AdminSchedule useScheduleHook={mockUseSchedule} />);

    expect(screen.getByText("جدول المركز اليومي")).toBeInTheDocument();
    expect(screen.getByText("يوم")).toBeInTheDocument();
    expect(screen.getByText("كل المحاضرين")).toBeInTheDocument();
    expect(screen.getByText("لا توجد جلسات")).toBeInTheDocument();
  });
});
