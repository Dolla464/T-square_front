import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminCreateOrder from "../AdminCreateOrder";

const mockCreateOrder = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("../../../hooks/useOrders", () => ({
  useOrders: () => ({
    createOrder: mockCreateOrder,
  }),
}));

vi.mock("../../../services/studentsServices", () => ({
  getStudents: vi.fn().mockResolvedValue({
    data: [{ id: 1, full_name: "Student One", email: "s@test.com", phone: "123" }],
    pagination: { total: 1 },
  }),
}));

vi.mock("../../../services/coursesServices", () => ({
  getCourses: vi.fn().mockResolvedValue({
    data: [
      {
        id: 2,
        title: "Course Two",
        price: 100,
        is_free: false,
        attendance_types: ["online", "offline"],
      },
    ],
    meta: { total: 1 },
  }),
}));

describe("AdminCreateOrder attendance type", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateOrder.mockResolvedValue({});
  });

  it("shows only selected course attendance types", async () => {
    render(<AdminCreateOrder />);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Course Two — EGP 100" })).toBeInTheDocument();
    });

    fireEvent.change(document.querySelector('select[name="course_id"]'), {
      target: { value: "2" },
    });

    await waitFor(() => {
      expect(screen.getByText("attendanceType")).toBeInTheDocument();
    });

    const attendanceSelect = screen.getAllByRole("combobox").find((select) =>
      Array.from(select.options).some((option) => option.value === "online"),
    );

    expect(attendanceSelect).toBeTruthy();
    expect(Array.from(attendanceSelect.options).map((option) => option.value)).toEqual([
      "",
      "online",
      "offline",
    ]);
  });

  it("includes selected attendance_type in create payload", async () => {
    render(<AdminCreateOrder />);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Course Two — EGP 100" })).toBeInTheDocument();
    });

    fireEvent.change(document.querySelector('select[name="student_id"]'), {
      target: { value: "1" },
    });
    fireEvent.change(document.querySelector('select[name="course_id"]'), {
      target: { value: "2" },
    });

    await waitFor(() => {
      expect(screen.getByText("attendanceType")).toBeInTheDocument();
    });

    const attendanceSelect = screen.getAllByRole("combobox").find((select) =>
      Array.from(select.options).some((option) => option.value === "online"),
    );

    fireEvent.change(attendanceSelect, { target: { value: "offline", name: "attendance_type" } });

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          student_id: 1,
          course_id: 2,
          attendance_type: "offline",
        }),
      );
    });

    expect(mockCreateOrder.mock.calls[0][0]).not.toHaveProperty("attendance_types");
  });

  it("clears unsupported attendance type when course changes", async () => {
    const { getCourses } = await import("../../../services/coursesServices");
    getCourses.mockResolvedValueOnce({
      data: [
        {
          id: 2,
          title: "Course Two",
          price: 100,
          attendance_types: ["online", "offline"],
        },
        {
          id: 3,
          title: "Course Three",
          price: 50,
          attendance_types: ["hybrid"],
        },
      ],
      meta: { total: 2 },
    });

    render(<AdminCreateOrder />);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Course Two — EGP 100" })).toBeInTheDocument();
    });

    const courseSelect = document.querySelector('select[name="course_id"]');
    fireEvent.change(courseSelect, { target: { value: "2" } });

    await waitFor(() => {
      expect(screen.getByText("attendanceType")).toBeInTheDocument();
    });

    const attendanceSelect = screen.getAllByRole("combobox").find((select) =>
      Array.from(select.options).some((option) => option.value === "online"),
    );

    fireEvent.change(attendanceSelect, { target: { value: "offline", name: "attendance_type" } });
    expect(attendanceSelect.value).toBe("offline");

    fireEvent.change(courseSelect, { target: { value: "3" } });

    await waitFor(() => {
      const updatedAttendanceSelect = screen.getAllByRole("combobox").find((select) =>
        Array.from(select.options).some((option) => option.value === "hybrid"),
      );
      expect(updatedAttendanceSelect.value).toBe("");
    });
  });
});
