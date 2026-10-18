import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GroupAttendanceCardsPreviewPanel, {
  BULK_CARD_MODES,
} from "../GroupAttendanceCardsPreviewPanel";

const mockPreview = vi.fn();

vi.mock("../../../../services/learningGroupServices", () => ({
  getGroupAttendanceCardsPreview: (...args) => mockPreview(...args),
  postGroupAttendanceCardsBatch: vi.fn(),
  getGroupAttendanceCardsBatchStatus: vi.fn(),
}));

vi.mock("../../../../../../components/shared/ConfirmDialog/confirmDialog", () => ({
  showConfirmCustom: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (opts?.count !== undefined) {
        return `${key}:${opts.count}`;
      }
      if (opts?.max !== undefined) {
        return `${key}:${opts.max}`;
      }
      return key;
    },
  }),
}));

vi.mock("../../../../../components/shared/Toaster/toaster", () => ({
  toastError: vi.fn(),
}));

const sampleData = {
  data: {
    future_batch_max: 50,
    counts: {
      total_enrollments: 3,
      eligible: 2,
      excluded_online: 1,
      with_active_card: 1,
      without_active_card: 1,
      inactive_students: 1,
    },
    students: [
      {
        student_id: 1,
        full_name: "Ali",
        enrollment_number: "E-1",
        student_status: "active",
        enrollment: { is_completed: false },
        has_active_card: false,
      },
      {
        student_id: 2,
        full_name: "Sara",
        enrollment_number: "E-2",
        student_status: "inactive",
        enrollment: { is_completed: true },
        has_active_card: true,
        card: { token_suffix: "ab12" },
      },
    ],
  },
};

describe("GroupAttendanceCardsPreviewPanel", () => {
  beforeEach(() => {
    mockPreview.mockReset();
    mockPreview.mockResolvedValue(sampleData);
  });

  it("loads preview for the selected group and shows default radio mode", async () => {
    render(<GroupAttendanceCardsPreviewPanel groupId={10} isArabic={false} />);

    await waitFor(() =>
      expect(mockPreview).toHaveBeenCalledWith(10, expect.objectContaining({ signal: expect.any(AbortSignal) })),
    );

    const issueNew = screen.getByLabelText(/groups_page.attendance_cards_preview.mode_issue_new/i);
    expect(issueNew).toBeChecked();
    expect(issueNew).toHaveAttribute("type", "radio");
  });

  it("enables bulk execute when preview has eligible students", async () => {
    render(<GroupAttendanceCardsPreviewPanel groupId={10} isArabic={false} />);

    await waitFor(() => screen.getByText("Ali"));

    const executeBtn = screen.getByRole("button", {
      name: /groups_page.attendance_cards_bulk.execute_btn/i,
    });
    expect(executeBtn).toBeEnabled();
    expect(mockPreview.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it("allows switching radio modes without extra API calls", async () => {
    const user = userEvent.setup();
    render(<GroupAttendanceCardsPreviewPanel groupId={10} isArabic={false} />);

    await waitFor(() => screen.getByText("Ali"));

    await user.click(
      screen.getByLabelText(/groups_page.attendance_cards_preview.mode_reissue_active/i),
    );

    expect(BULK_CARD_MODES.REISSUE_ACTIVE_ONLY).toBe("reissue_active_only");
    const callsAfterLoad = mockPreview.mock.calls.length;
    await user.click(
      screen.getByLabelText(/groups_page.attendance_cards_preview.mode_issue_all/i),
    );
    expect(mockPreview.mock.calls.length).toBe(callsAfterLoad);
  });

  it("renders table with RTL direction when isArabic", async () => {
    render(<GroupAttendanceCardsPreviewPanel groupId={10} isArabic />);

    await waitFor(() => screen.getByText("Sara"));

    const table = screen.getByRole("table");
    expect(table).toHaveAttribute("dir", "rtl");
  });

  it("shows error state without issuing", async () => {
    mockPreview.mockRejectedValue(new Error("network"));

    render(<GroupAttendanceCardsPreviewPanel groupId={10} isArabic={false} />);

    await waitFor(() =>
      screen.getByText("groups_page.attendance_cards_preview.load_failed"),
    );
  });

  it("ignores stale success from previous group after switching groups", async () => {
    const resolvers = {};
    mockPreview.mockImplementation((groupId) => {
      return new Promise((resolve, reject) => {
        resolvers[groupId] = { resolve, reject };
      });
    });

    const { rerender } = render(
      <GroupAttendanceCardsPreviewPanel groupId={10} isArabic={false} />,
    );

    await waitFor(() => expect(resolvers[10]).toBeDefined());

    rerender(<GroupAttendanceCardsPreviewPanel groupId={20} isArabic={false} />);

    await waitFor(() => expect(resolvers[20]).toBeDefined());

    resolvers[20].resolve({
      data: {
        future_batch_max: 50,
        counts: {
          total_enrollments: 1,
          eligible: 1,
          excluded_online: 0,
          with_active_card: 0,
          without_active_card: 1,
          inactive_students: 0,
        },
        students: [
          {
            student_id: 20,
            full_name: "Group B Student",
            student_status: "active",
            enrollment: { is_completed: false },
            has_active_card: false,
          },
        ],
      },
    });

    await waitFor(() => screen.getByText("Group B Student"));

    resolvers[10].resolve({
      data: {
        future_batch_max: 50,
        counts: {
          total_enrollments: 1,
          eligible: 1,
          excluded_online: 0,
          with_active_card: 0,
          without_active_card: 1,
          inactive_students: 0,
        },
        students: [
          {
            student_id: 10,
            full_name: "Group A Student",
            student_status: "active",
            enrollment: { is_completed: false },
            has_active_card: false,
          },
        ],
      },
    });

    await waitFor(() => expect(screen.queryByText("Group A Student")).not.toBeInTheDocument());
    expect(screen.getByText("Group B Student")).toBeInTheDocument();
  });

  it("ignores stale error from previous group when current group succeeded", async () => {
    const resolvers = {};
    mockPreview.mockImplementation((groupId) => {
      return new Promise((resolve, reject) => {
        resolvers[groupId] = { resolve, reject };
      });
    });

    const { rerender } = render(
      <GroupAttendanceCardsPreviewPanel groupId={10} isArabic={false} />,
    );

    await waitFor(() => expect(resolvers[10]).toBeDefined());

    rerender(<GroupAttendanceCardsPreviewPanel groupId={20} isArabic={false} />);

    await waitFor(() => expect(resolvers[20]).toBeDefined());

    resolvers[20].resolve({
      data: {
        future_batch_max: 50,
        counts: {
          total_enrollments: 1,
          eligible: 1,
          excluded_online: 0,
          with_active_card: 0,
          without_active_card: 1,
          inactive_students: 0,
        },
        students: [
          {
            student_id: 20,
            full_name: "Group B Student",
            student_status: "active",
            enrollment: { is_completed: false },
            has_active_card: false,
          },
        ],
      },
    });

    await waitFor(() => screen.getByText("Group B Student"));

    resolvers[10].reject(new Error("stale failure"));

    await waitFor(() => expect(screen.getByText("Group B Student")).toBeInTheDocument());
    expect(
      screen.queryByText("groups_page.attendance_cards_preview.load_failed"),
    ).not.toBeInTheDocument();
  });
});
