import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import QuizExamPage from "../QuizExamPage";

const mockNavigate = vi.fn();

const essayQuestionText = "اشرح مفهوم Virtual DOM";
const mockExam = {
  attempt_id: 42,
  status: "ongoing",
  started_at: new Date().toISOString(),
  duration_minutes: 30,
  remaining_seconds: 1800,
  questions: [
    {
      id: 7,
      type: "essay",
      question_text: essayQuestionText,
    },
  ],
};

vi.mock("react-router-dom", () => ({
  useParams: () => ({ quizId: "1" }),
  useNavigate: () => mockNavigate,
  useBlocker: () => ({ state: "unblocked", proceed: vi.fn(), reset: vi.fn() }),
}));

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }) => <>{children}</>,
}));

vi.mock("../../../../../components/shared/Toaster/toaster", () => ({
  toastCustom: vi.fn(),
}));

vi.mock("../../../../../components/shared/ConfirmDialog/confirmDialog", () => ({
  showConfirmCustom: vi.fn(),
}));

vi.mock("../../../hooks/useExamIntegrityMonitor", () => ({
  useExamIntegrityMonitor: vi.fn(),
}));

vi.mock("../../../services/dashboardService", () => ({
  getStudentExams: vi.fn().mockResolvedValue({
    data: { data: [{ id: 1, has_ongoing_attempt: true }] },
  }),
  getCourseDetails: vi.fn(),
  recordExamQuestionTime: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "ar" },
  }),
}));

vi.mock("../../../hooks/useExam", () => ({
  mapExamResults: (results) => results,
  useExam: () => ({
    exam: mockExam,
    loading: false,
    error: null,
    startExam: vi.fn().mockResolvedValue(undefined),
    saveAnswer: vi.fn(),
    submitExam: vi.fn(),
    submitting: false,
    isSavingAnswer: false,
    recoverClosedAttempt: vi.fn(),
    syncExamTime: vi.fn(),
    scheduleAutosave: vi.fn(),
    flushAutosaves: vi.fn().mockResolvedValue(undefined),
    flushAutosaveForQuestion: vi.fn().mockResolvedValue(undefined),
    answerSaveByQuestion: {},
    waitForPendingSaves: vi.fn().mockResolvedValue(undefined),
    withAttemptFinalization: vi.fn((_id, cb) => cb()),
  }),
}));

describe("QuizExamPage essay bidi", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    sessionStorage.clear();
  });

  it("sets dir=auto on the essay answer textarea", async () => {
    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText(essayQuestionText)).toBeInTheDocument();
    });

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("dir", "auto");
  });
});
