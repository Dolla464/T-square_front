import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  mockNavigate,
  mockExam,
  submitExamMock,
  showConfirmCustom,
  blockerProceed,
  blockerReset,
  useExamConfig,
} = vi.hoisted(() => {
  const mockNavigate = vi.fn();
  const submitExamMock = vi.fn();
  const showConfirmCustom = vi.fn();
  const blockerProceed = vi.fn();
  const blockerReset = vi.fn();
  const useExamConfig = { loading: false };

  const mockExam = {
    attempt_id: 42,
    status: "ongoing",
    started_at: new Date().toISOString(),
    duration_minutes: 30,
    remaining_seconds: 1800,
    user_answers: {},
    questions: [
      {
        id: 7,
        type: "multiple_choice",
        question_text: "Pick one",
        choices: [
          { id: 101, choice_text: "Alpha" },
          { id: 102, choice_text: "Beta" },
        ],
      },
    ],
  };

  return {
    mockNavigate,
    mockExam,
    submitExamMock,
    showConfirmCustom,
    blockerProceed,
    blockerReset,
    useExamConfig,
  };
});

import QuizExamPage from "../QuizExamPage";

vi.mock("react-router-dom", () => ({
  useParams: () => ({ quizId: "1" }),
  useNavigate: () => mockNavigate,
  useBlocker: () => ({
    state: "blocked",
    proceed: blockerProceed,
    reset: blockerReset,
  }),
}));

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }) => <>{children}</>,
}));

vi.mock("../../../../../components/shared/Toaster/toaster", () => ({
  toastCustom: vi.fn(),
}));

vi.mock("../../../../../components/shared/ConfirmDialog/confirmDialog", () => ({
  showConfirmCustom,
}));

vi.mock("../../../hooks/useExamIntegrityMonitor", () => ({
  useExamIntegrityMonitor: vi.fn(),
}));

vi.mock("../../../hooks/useExam", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useExam: () => ({
      exam: mockExam,
      loading: useExamConfig.loading,
      error: null,
      startExam: vi.fn().mockResolvedValue(undefined),
      saveAnswer: vi.fn().mockResolvedValue(undefined),
      submitExam: submitExamMock,
      submitting: false,
      recoverClosedAttempt: vi.fn().mockResolvedValue(false),
      syncExamTime: vi.fn().mockResolvedValue(null),
      withAttemptFinalization: vi.fn((_attemptId, callback) => callback()),
      scheduleAutosave: vi.fn(),
      flushAutosaves: vi.fn().mockResolvedValue(undefined),
      flushAutosaveForQuestion: vi.fn().mockResolvedValue(undefined),
      answerSaveByQuestion: {},
    }),
  };
});

vi.mock("../../../services/dashboardService", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getStudentExams: vi.fn(() => new Promise(() => {})),
    getCourseDetails: vi.fn(),
    recordExamQuestionTime: vi.fn().mockResolvedValue({ data: { status: "ok" } }),
    getExamTimeStatus: vi.fn(),
    getAttemptReview: vi.fn(),
    recordExamJourneyEvents: vi.fn(),
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en" },
  }),
}));

describe("QuizExamPage router leave during initialization (synthetic contract)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockNavigate.mockClear();
    useExamConfig.loading = false;
    showConfirmCustom.mockResolvedValue(true);
    submitExamMock.mockResolvedValue({
      results: {
        score: 1,
        total_marks: 1,
        status: "passed",
        is_passed: true,
      },
    });
  });

  it("confirms blocked navigation during init without submitting the attempt", async () => {
    render(<QuizExamPage />);

    await waitFor(() => {
      expect(showConfirmCustom).toHaveBeenCalledTimes(1);
      expect(blockerProceed).toHaveBeenCalledTimes(1);
    });

    expect(blockerReset).not.toHaveBeenCalled();
    expect(submitExamMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("resets the blocker when leave confirmation is cancelled during init", async () => {
    showConfirmCustom.mockResolvedValue(false);

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(showConfirmCustom).toHaveBeenCalledTimes(1);
      expect(blockerReset).toHaveBeenCalledTimes(1);
    });

    expect(blockerProceed).not.toHaveBeenCalled();
    expect(submitExamMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("confirms blocked navigation when loadingRef is true without submitting (synthetic)", async () => {
    useExamConfig.loading = true;

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(showConfirmCustom).toHaveBeenCalledTimes(1);
      expect(blockerProceed).toHaveBeenCalledTimes(1);
    });

    expect(blockerReset).not.toHaveBeenCalled();
    expect(submitExamMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
