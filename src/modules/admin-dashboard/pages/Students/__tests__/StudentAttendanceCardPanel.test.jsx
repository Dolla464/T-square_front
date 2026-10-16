import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StudentAttendanceCardPanel from "../components/StudentAttendanceCardPanel";
import AttendanceCardOneTimeModal from "../components/AttendanceCardOneTimeModal";
import { toastError, toastSuccess, toastWarning } from "../../../../../components/shared/Toaster/toaster";

const mockFetch = vi.fn();
const mockIssue = vi.fn();
const mockReissue = vi.fn();
const mockRevoke = vi.fn();

vi.mock("../../../services/studentAttendanceCardService", () => ({
  fetchStudentAttendanceCard: (...args) => mockFetch(...args),
  issueStudentAttendanceCard: (...args) => mockIssue(...args),
  reissueStudentAttendanceCard: (...args) => mockReissue(...args),
  revokeStudentAttendanceCard: (...args) => mockRevoke(...args),
}));

vi.mock("../../../../../components/shared/ConfirmDialog/confirmDialog", () => ({
  showConfirmCustom: vi.fn().mockResolvedValue(true),
}));

vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }) => (
    <div data-testid="qr-code-mock" data-value={value}>
      QR
    </div>
  ),
}));

vi.mock("../../../../../components/shared/Toaster/toaster", () => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  toastWarning: vi.fn(),
}));

const tMap = {
  "students_page.attendance_card.section_title": "Permanent attendance card",
  "students_page.attendance_card.section_subtitle": "Subtitle",
  "students_page.attendance_card.loading": "Loading",
  "students_page.attendance_card.load_failed": "Load failed",
  "students_page.attendance_card.retry": "Try again",
  "students_page.attendance_card.status_label": "Card status",
  "students_page.attendance_card.status_active": "Active card on file",
  "students_page.attendance_card.status_none": "No active card",
  "students_page.attendance_card.issued_at": "Issued at",
  "students_page.attendance_card.card_suffix": "Card ID suffix",
  "students_page.attendance_card.no_card_hint": "No card hint",
  "students_page.attendance_card.cannot_retrieve_hint": "Cannot retrieve hint",
  "students_page.attendance_card.issue_btn": "Issue card",
  "students_page.attendance_card.reissue_btn": "Reissue card",
  "students_page.attendance_card.revoke_btn": "Revoke card",
  "students_page.attendance_card.confirm_issue_title": "Issue?",
  "students_page.attendance_card.confirm_issue_message": "Issue msg",
  "students_page.attendance_card.confirm_issue_btn": "Issue",
  "students_page.attendance_card.confirm_reissue_title": "Reissue?",
  "students_page.attendance_card.confirm_reissue_message": "Reissue msg",
  "students_page.attendance_card.confirm_reissue_btn": "Reissue",
  "students_page.attendance_card.one_time_title": "Save QR now",
  "students_page.attendance_card.one_time_warning": "One time warning",
  "students_page.attendance_card.print": "Print card",
  "students_page.attendance_card.done": "Done",
  "students_page.attendance_card.print_label": "Print label",
  "students_page.attendance_card.print_instructions": "Print instructions",
  "students_page.table_enrollment": "Enrollment Number",
  "students_page.attendance_card.toast_issued": "Issued",
  "students_page.attendance_card.toast_reissued": "Reissued",
  "students_page.attendance_card.inactive_scan_warning": "Inactive warning",
  "students_page.attendance_card.revoke_modal_title": "Revoke",
  "students_page.attendance_card.revoke_modal_body": "Revoke body",
  "students_page.attendance_card.revoke_reason_label": "Reason",
  "students_page.attendance_card.revoke_reason_placeholder": "Reason ph",
  "students_page.attendance_card.revoke_confirm_btn": "Revoke confirm",
  "students_page.attendance_card.cancel": "Cancel",
  "students_page.attendance_card.toast_revoked": "Revoked",
  "students_page.attendance_card.token_not_shown_after_success": "Token not shown warning",
  "students_page.attendance_card.action_outcome_uncertain": "Outcome uncertain",
  "students_page.attendance_card.errors.generic": "Generic error",
  "students_page.attendance_card.errors.card_already_active": "Already active",
  "students_page.attendance_card.errors.no_active_card": "No active card error",
  "students_page.attendance_card.errors.forbidden": "Forbidden",
  "students_page.attendance_card.errors.rate_limit": "Rate limit",
  "students_page.attendance_card.errors.server": "Server error",
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => tMap[key] ?? key,
    i18n: { language: "en" },
  }),
}));

describe("StudentAttendanceCardPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      data: { has_active_card: false, card: null },
    });
  });

  it("loads and shows no active card status", async () => {
    render(
      <StudentAttendanceCardPanel
        studentId={5}
        studentName="Ali Student"
        enrollmentNumber="ENR-1"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("No active card")).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledWith(5, expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(screen.queryByTestId("qr-code-mock")).not.toBeInTheDocument();
    expect(screen.queryByText("Reissue card")).not.toBeInTheDocument();
  });

  it("shows active card metadata without raw token", async () => {
    mockFetch.mockResolvedValue({
      data: {
        has_active_card: true,
        card: {
          id: 1,
          token_suffix: "ab12",
          issued_at: "2026-01-01 10:00:00",
        },
      },
    });

    render(
      <StudentAttendanceCardPanel
        studentId={5}
        studentName="Ali"
        enrollmentNumber="ENR-1"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Active card on file")).toBeInTheDocument();
    });
    expect(screen.getByText("••••ab12")).toBeInTheDocument();
    expect(screen.queryByText(/card_[0-9a-f]+/)).not.toBeInTheDocument();
  });

  it("shows retry when initial load fails", async () => {
    mockFetch.mockReset();
    mockFetch.mockRejectedValue({
      response: { status: 500, data: {} },
    });

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Load failed")).toBeInTheDocument();
    });
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("opens QR modal with plain_text_token only after issue", async () => {
    mockFetch
      .mockResolvedValueOnce({ data: { has_active_card: false, card: null } })
      .mockResolvedValueOnce({
        data: {
          has_active_card: true,
          card: { id: 2, token_suffix: "cd34", issued_at: "2026-01-02" },
        },
      });
    mockIssue.mockResolvedValue({
      data: {
        plain_text_token: "card_" + "a".repeat(64),
        card: { id: 2, token_suffix: "cd34" },
        warnings: [{ code: "STUDENT_INACTIVE", message: "Inactive blocked" }],
      },
    });

    render(
      <StudentAttendanceCardPanel
        studentId={5}
        studentName="Ali"
        enrollmentNumber="ENR-1"
      />,
    );

    await waitFor(() => screen.getByText("Issue card"));
    await userEvent.click(screen.getByText("Issue card"));

    await waitFor(() => {
      expect(screen.getByTestId("qr-code-mock")).toBeInTheDocument();
    });

    const qr = screen.getByTestId("qr-code-mock");
    expect(qr.getAttribute("data-value")).toMatch(/^card_[0-9a-f]{64}$/);
    expect(screen.getByText("Inactive blocked")).toBeInTheDocument();
    expect(mockIssue).toHaveBeenCalledTimes(1);
  });

  it("does not show QR when issue fails", async () => {
    mockFetch.mockResolvedValue({ data: { has_active_card: false, card: null } });
    mockIssue.mockRejectedValue({
      response: { status: 422, data: { code: "CARD_ALREADY_ACTIVE" } },
    });

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Issue card"));
    await userEvent.click(screen.getByText("Issue card"));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalled();
    });
    expect(screen.queryByTestId("qr-code-mock")).not.toBeInTheDocument();
  });

  it("reissues and shows a new QR token", async () => {
    const secondToken = "card_" + "b".repeat(64);

    mockFetch.mockResolvedValue({
      data: {
        has_active_card: true,
        card: { id: 1, token_suffix: "aa11", issued_at: "2026-01-01" },
      },
    });
    mockReissue.mockResolvedValue({
      data: {
        plain_text_token: secondToken,
        card: { id: 2, token_suffix: "bb22" },
      },
    });

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Reissue card"));
    await userEvent.click(screen.getByText("Reissue card"));

    await waitFor(() => {
      expect(screen.getByTestId("qr-code-mock")).toHaveAttribute("data-value", secondToken);
    });
  });

  it("revokes with optional revocation_reason", async () => {
    mockFetch.mockReset();
    let revoked = false;
    mockFetch.mockImplementation(async () => {
      if (revoked) {
        return { data: { has_active_card: false, card: null } };
      }
      return {
        data: {
          has_active_card: true,
          card: { id: 1, token_suffix: "xx99", issued_at: "2026-01-01" },
        },
      };
    });
    mockRevoke.mockImplementation(async () => {
      revoked = true;
      return {
        data: { card: { id: 1, revoked_at: "2026-01-02", revocation_reason: "Lost" } },
      };
    });

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Active card on file")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText("Revoke card"));
    await userEvent.type(screen.getByPlaceholderText("Reason ph"), "Lost card");
    await userEvent.click(screen.getByText("Revoke confirm"));

    await waitFor(() => {
      expect(mockRevoke).toHaveBeenCalledWith(
        5,
        { revocation_reason: "Lost card" },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  it("keeps revoke modal open and avoids success toast when revoke fails", async () => {
    mockFetch.mockResolvedValue({
      data: {
        has_active_card: true,
        card: { id: 1, token_suffix: "xx99", issued_at: "2026-01-01" },
      },
    });
    mockRevoke.mockRejectedValue({
      response: { status: 422, data: { code: "NO_ACTIVE_CARD" } },
    });

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Revoke card"));
    await userEvent.click(screen.getByText("Revoke card"));
    await userEvent.click(screen.getByText("Revoke confirm"));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalled();
    });
    expect(toastSuccess).not.toHaveBeenCalledWith("Revoked");
    expect(screen.getByText("Revoke")).toBeInTheDocument();
  });

  it("does not expose token from GET refresh after issue", async () => {
    mockFetch
      .mockResolvedValueOnce({ data: { has_active_card: false, card: null } })
      .mockResolvedValueOnce({
        data: {
          has_active_card: true,
          card: { id: 2, token_suffix: "cd34" },
        },
      });
    mockIssue.mockResolvedValue({
      data: {
        plain_text_token: "card_" + "e".repeat(64),
        card: { id: 2, token_suffix: "cd34" },
      },
    });

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Issue card"));
    await userEvent.click(screen.getByText("Issue card"));
    await userEvent.click(await screen.findByText("Done"));

    await waitFor(() => {
      expect(screen.queryByTestId("qr-code-mock")).not.toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(mockIssue).toHaveBeenCalledTimes(1);
  });

  it("clears QR token when Done is clicked", async () => {
    mockFetch.mockResolvedValue({ data: { has_active_card: false, card: null } });
    mockIssue.mockResolvedValue({
      data: {
        plain_text_token: "card_" + "b".repeat(64),
        card: { id: 3, token_suffix: "ef56" },
      },
    });

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Issue card"));
    await userEvent.click(screen.getByText("Issue card"));
    await waitFor(() => screen.getByTestId("qr-code-mock"));

    await userEvent.click(screen.getByText("Done"));

    await waitFor(() => {
      expect(screen.queryByTestId("qr-code-mock")).not.toBeInTheDocument();
    });
  });

  it("does not show QR for student B when issue for A completes after switch", async () => {
    let resolveIssue;
    mockFetch.mockImplementation(async (id) => ({
      data: {
        has_active_card: id === 99,
        card: id === 99 ? { id: 10, token_suffix: "zz11" } : null,
      },
    }));
    mockIssue.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveIssue = resolve;
        }),
    );

    const { rerender } = render(
      <StudentAttendanceCardPanel
        key={5}
        studentId={5}
        studentName="Ali"
        enrollmentNumber=""
      />,
    );

    await waitFor(() => screen.getByText("Issue card"));
    await userEvent.click(screen.getByText("Issue card"));

    rerender(
      <StudentAttendanceCardPanel
        key={99}
        studentId={99}
        studentName="Other"
        enrollmentNumber=""
      />,
    );

    resolveIssue({
      data: {
        plain_text_token: "card_" + "f".repeat(64),
        card: { id: 2, token_suffix: "cd34" },
      },
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(99, expect.any(Object)));

    expect(screen.queryByTestId("qr-code-mock")).not.toBeInTheDocument();
  });

  it("does not reopen QR after unmount when issue completes late", async () => {
    let resolveIssue;
    mockFetch.mockResolvedValue({ data: { has_active_card: false, card: null } });
    mockIssue.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveIssue = resolve;
        }),
    );

    const { unmount } = render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Issue card"));
    await userEvent.click(screen.getByText("Issue card"));

    unmount();

    resolveIssue({
      data: {
        plain_text_token: "card_" + "g".repeat(64),
        card: { id: 3, token_suffix: "ef56" },
      },
    });

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Issue card"));
    expect(screen.queryByTestId("qr-code-mock")).not.toBeInTheDocument();
  });

  it("does not show QR when reissue completes after panel unmount", async () => {
    let resolveReissue;
    mockFetch.mockResolvedValue({
      data: {
        has_active_card: true,
        card: { id: 1, token_suffix: "aa11", issued_at: "2026-01-01" },
      },
    });
    mockReissue.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveReissue = resolve;
        }),
    );

    const { unmount } = render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Reissue card"));
    await userEvent.click(screen.getByText("Reissue card"));

    unmount();

    resolveReissue({
      data: {
        plain_text_token: "card_" + "h".repeat(64),
        card: { id: 2, token_suffix: "bb22" },
      },
    });

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Reissue card"));
    expect(screen.queryByTestId("qr-code-mock")).not.toBeInTheDocument();
  });

  it("shows uncertain message on ambiguous network issue without auto reissue", async () => {
    mockFetch.mockResolvedValue({ data: { has_active_card: false, card: null } });
    mockIssue.mockRejectedValue({ request: {}, message: "Network Error" });

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Issue card"));
    await userEvent.click(screen.getByText("Issue card"));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Outcome uncertain");
    });
    expect(mockReissue).not.toHaveBeenCalled();
    expect(screen.queryByTestId("qr-code-mock")).not.toBeInTheDocument();
  });

  it("disables action buttons while issue request is in flight", async () => {
    mockFetch.mockResolvedValue({ data: { has_active_card: false, card: null } });
    let resolveIssue;
    mockIssue.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveIssue = resolve;
        }),
    );

    render(
      <StudentAttendanceCardPanel studentId={5} studentName="Ali" enrollmentNumber="" />,
    );

    await waitFor(() => screen.getByText("Issue card"));
    await userEvent.click(screen.getByText("Issue card"));

    const issueBtn = screen.getByText("Issue card").closest("button");
    expect(issueBtn).toBeDisabled();

    resolveIssue({
      data: {
        plain_text_token: "card_" + "d".repeat(64),
        card: { id: 5, token_suffix: "ij90" },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId("qr-code-mock")).toBeInTheDocument();
    });
  });

  it("print CSS hides inner no-print controls but not the print root id", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const cssText = readFileSync(
      join(here, "..", "StudentAttendanceCard.css"),
      "utf8",
    );
    expect(cssText).toContain("@media print");
    expect(cssText).toContain("#attendance-card-print-root");
    expect(cssText).toMatch(/\.attendance-card-onetime-modal \.no-print[\s\S]*display:\s*none/);
    expect(cssText).not.toMatch(/#attendance-card-print-root\s*\{[^}]*display:\s*none/);
    expect(cssText).not.toContain("body *");
    expect(cssText).toContain("body:has(#attendance-card-print-root)");
  });

  it("one-time modal keeps print root outside no-print ancestors", () => {
    render(
      <AttendanceCardOneTimeModal
        show
        plainTextToken={"card_" + "j".repeat(64)}
        studentName="Ali"
        enrollmentNumber="E-1"
        inactiveWarning={null}
        onClose={() => {}}
      />,
    );

    const printRoot = document.getElementById("attendance-card-print-root");
    expect(printRoot).toBeTruthy();

    let node = printRoot;
    while (node) {
      expect(node.classList.contains("no-print")).toBe(false);
      node = node.parentElement;
    }

    const modal = document.querySelector(".attendance-card-onetime-modal");
    expect(modal?.classList.contains("no-print")).toBe(false);
    expect(screen.getByTestId("qr-code-mock")).toBeInTheDocument();
  });
});
