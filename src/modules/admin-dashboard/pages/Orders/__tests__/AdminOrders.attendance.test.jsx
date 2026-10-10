import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminOrders from "../AdminOrders";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => {
      if (key === "attendanceTypes.online") return "Online";
      if (key === "allAttendanceTypes") return "All Attendance Types";
      if (key === "attendanceTypeUnassigned") return "Not assigned";
      return key;
    },
    i18n: { language: "en" },
  }),
}));

vi.mock("../../../../../components/shared/ConfirmDialog/confirmDialog", () => ({
  showConfirmCustom: vi.fn(),
  showAttendanceTypePicker: vi.fn(),
}));

vi.mock("../../../hooks/useOrders", () => ({
  useOrders: () => ({
    orders: [
      {
        id: 10,
        status: "completed",
        total_amount: 0,
        billing_name: "Student",
        "student.full_name": "Student",
        "enrollments.course.title": "Course A",
        "enrollments.attendance_type": "online",
      },
      {
        id: 11,
        status: "pending",
        total_amount: 100,
        billing_name: "Student Two",
        "student.full_name": "Student Two",
        "enrollments.course.title": "Course B",
        "enrollments.attendance_type": null,
      },
    ],
    loading: false,
    exportLoading: false,
    stats: null,
    pagination: null,
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
    updateOrderStatus: vi.fn(),
    deleteOrder: vi.fn(),
    handleExport: vi.fn(),
  }),
}));

describe("AdminOrders attendance display", () => {
  it("reads enrollments.attendance_type in the list", () => {
    render(<AdminOrders showStats={false} canExport={false} canDelete={false} />);

    expect(screen.getAllByText("Online").length).toBeGreaterThan(0);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders attendance type filter after payment status filter", () => {
    render(<AdminOrders showStats={false} canExport={false} canDelete={false} />);

    const attendanceFilter = screen.getByRole("combobox", { name: "All Attendance Types" });

    expect(attendanceFilter).toBeInTheDocument();
    expect(attendanceFilter).toHaveValue("all");
    expect(screen.getByRole("option", { name: "Online" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Not assigned" })).toBeInTheDocument();
  });
});
