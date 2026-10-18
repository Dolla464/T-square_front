import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupAttendanceCardsPreviewPanel from "../GroupAttendanceCardsPreviewPanel";

vi.mock("../../../../services/learningGroupServices", () => ({
  getGroupAttendanceCardsPreview: vi.fn(),
  postGroupAttendanceCardsBatch: vi.fn(),
  getGroupAttendanceCardsBatchStatus: vi.fn(),
}));

vi.mock("../../../../../../components/shared/ConfirmDialog/confirmDialog", () => ({
  showConfirmCustom: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock("../../../../../components/shared/Toaster/toaster", () => ({
  toastError: vi.fn(),
}));

import {
  getGroupAttendanceCardsPreview,
  postGroupAttendanceCardsBatch,
} from "../../../../services/learningGroupServices";

const previewPayload = {
  data: {
    group_id: 10,
    group_name: "G1",
    course_title: "Course",
    future_batch_max: 50,
    counts: { eligible: 1, excluded_online: 0, inactive_students: 0 },
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

describe("GroupAttendanceCardsBulk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGroupAttendanceCardsPreview.mockResolvedValue(previewPayload);
  });

  it("runs bulk issuance and shows success result", async () => {
    postGroupAttendanceCardsBatch.mockResolvedValue({
      data: {
        operation: { status: "completed", snapshot_count: 1 },
        batch: { has_more: false, batch_index: 0 },
        students: [
          {
            sequence: 0,
            student_id: 5,
            status: "success",
            result_code: "ISSUED",
            plain_text_token: "card_" + "a".repeat(64),
            token_available: true,
          },
        ],
      },
    });

    render(<GroupAttendanceCardsPreviewPanel groupId={10} isArabic={false} />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /groups_page.attendance_cards_bulk.execute_btn/i }),
      ).toBeEnabled(),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /groups_page.attendance_cards_bulk.execute_btn/i }),
    );

    await waitFor(() =>
      expect(screen.getByText(/groups_page.attendance_cards_bulk.results_title/i)).toBeInTheDocument(),
    );
    expect(postGroupAttendanceCardsBatch).toHaveBeenCalledTimes(1);
  });

  it("keeps preview when group id changes without applying stale bulk state", async () => {
    getGroupAttendanceCardsPreview
      .mockResolvedValueOnce(previewPayload)
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: { ...previewPayload.data, group_id: 20 } }), 50);
          }),
      );

    const { rerender } = render(
      <GroupAttendanceCardsPreviewPanel groupId={10} isArabic={false} />,
    );

    await waitFor(() => expect(getGroupAttendanceCardsPreview).toHaveBeenCalledWith(10, expect.any(Object)));

    rerender(<GroupAttendanceCardsPreviewPanel groupId={20} isArabic={false} />);

    await waitFor(() => expect(getGroupAttendanceCardsPreview).toHaveBeenCalledWith(20, expect.any(Object)));
  });
});
