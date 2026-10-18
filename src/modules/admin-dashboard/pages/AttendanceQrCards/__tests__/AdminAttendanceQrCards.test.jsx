import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminAttendanceQrCards from "../AdminAttendanceQrCards";

vi.mock("../../../services/learningGroupServices", () => ({
  getLearningGroupsSelection: vi.fn(),
  getGroupAttendanceCardsPreview: vi.fn(),
  postGroupAttendanceCardsBatch: vi.fn(),
  getGroupAttendanceCardsBatchStatus: vi.fn(),
}));

vi.mock("../../../services/studentsServices", () => ({
  getStudents: vi.fn(),
  getStudentById: vi.fn(),
}));

vi.mock("../../../services/studentAttendanceCardService", () => ({
  fetchStudentAttendanceCard: vi.fn().mockResolvedValue({
    data: { has_active_card: false, card: null },
  }),
  issueStudentAttendanceCard: vi.fn(),
  reissueStudentAttendanceCard: vi.fn(),
  revokeStudentAttendanceCard: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("../../../../../components/shared/ConfirmDialog/confirmDialog", () => ({
  showConfirmCustom: vi.fn(() => Promise.resolve(false)),
}));

vi.mock("../../../../../components/shared/Toaster/toaster", () => ({
  toastError: vi.fn(),
  toastWarning: vi.fn(),
}));

import {
  getGroupAttendanceCardsPreview,
  getLearningGroupsSelection,
} from "../../../services/learningGroupServices";
import { getStudents } from "../../../services/studentsServices";

const previewPayload = {
  data: {
    group_id: 10,
    group_name: "G1",
    course_title: "Course",
    future_batch_max: 50,
    counts: {
      eligible: 1,
      excluded_online: 0,
      inactive_students: 0,
      with_active_card: 0,
      without_active_card: 1,
    },
    students: [
      {
        student_id: 5,
        full_name: "Student A",
        enrollment_number: "E1",
        student_status: "active",
        enrollment: { is_completed: false },
        has_active_card: false,
        warnings: [],
      },
    ],
  },
};

function renderPage(initialEntries = ["/admin/attendance-qr-cards"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AdminAttendanceQrCards />
    </MemoryRouter>,
  );
}

describe("AdminAttendanceQrCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLearningGroupsSelection.mockResolvedValue({
      data: [{ id: 10, name: "Group Ten" }],
    });
    getGroupAttendanceCardsPreview.mockResolvedValue(previewPayload);
    getStudents.mockResolvedValue({
      data: [
        {
          id: 7,
          full_name: "Solo Student",
          enrollment_number: "TSQ-1",
        },
      ],
      pagination: { total: 1 },
    });
  });

  it("renders page header and group scope by default", async () => {
    renderPage();
    expect(screen.getByText("attendanceQrCardsPage.title")).toBeInTheDocument();
    await waitFor(() =>
      expect(getLearningGroupsSelection).toHaveBeenCalled(),
    );
    expect(
      screen.getByLabelText("attendanceQrCardsPage.scope_group"),
    ).toBeChecked();
  });

  it("loads bulk preview when a group is selected", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Group Ten" })).toBeInTheDocument(),
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      String(10),
    );
    await waitFor(() =>
      expect(getGroupAttendanceCardsPreview).toHaveBeenCalledWith(10, expect.any(Object)),
    );
    expect(
      screen.getByText("groups_page.attendance_cards_preview.section_title"),
    ).toBeInTheDocument();
  });

  it("shows student card panel when student scope is selected", async () => {
    renderPage();
    await userEvent.click(
      screen.getByLabelText("attendanceQrCardsPage.scope_student"),
    );
    await waitFor(() => expect(getStudents).toHaveBeenCalled());
    const selects = screen.getAllByRole("combobox");
    const studentSelect = selects[selects.length - 1];
    await userEvent.selectOptions(studentSelect, "7");
    await waitFor(() =>
      expect(
        screen.getByText("students_page.attendance_card.section_title"),
      ).toBeInTheDocument(),
    );
  });
});
