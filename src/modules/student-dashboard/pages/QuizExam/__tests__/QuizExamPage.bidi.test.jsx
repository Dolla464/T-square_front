import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import QuizExamPage from "../QuizExamPage";

const mockNavigate = vi.fn();

const mixedQuestionText =
  "اختر الإجابة الصحيحة للسؤال رقم 10 من A إلى D.";
const mixedChoiceText = "الإجابة B مع option A";
const englishChoiceText = "Only English option text";

const mockExam = {
  attempt_id: 42,
  status: "ongoing",
  started_at: new Date().toISOString(),
  questions: [
    {
      id: 1,
      type: "multiple_choice",
      question_text: mixedQuestionText,
      choices: [
        { id: 101, choice_text: mixedChoiceText },
        { id: 102, choice_text: englishChoiceText },
      ],
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
    i18n: { language: "en" },
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

describe("QuizExamPage bidi (dir=auto on option text)", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    sessionStorage.clear();
  });

  it("renders dir=auto on option-text for mixed Arabic + English + numbers", async () => {
    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText(mixedChoiceText)).toBeInTheDocument();
    });

    const mixedSpan = screen.getByText(mixedChoiceText);
    expect(mixedSpan).toHaveClass("option-text");
    expect(mixedSpan).toHaveAttribute("dir", "auto");
  });

  it("keeps English-only choice text unchanged with dir=auto on option-text", async () => {
    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText(englishChoiceText)).toBeInTheDocument();
    });

    const englishSpan = screen.getByText(englishChoiceText);
    expect(englishSpan).toHaveTextContent(englishChoiceText);
    expect(englishSpan).toHaveAttribute("dir", "auto");
  });
});
