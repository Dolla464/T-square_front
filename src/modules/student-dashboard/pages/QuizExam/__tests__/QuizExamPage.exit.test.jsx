import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MCQ_AUTOSAVE_DEBOUNCE_MS } from "../../../hooks/examAnswerSaveConstants";

const {
  mockNavigate,
  mockExam,
  saveExamAnswer,
  submitExamApi,
  showConfirmCustom,
} = vi.hoisted(() => {
  const mockNavigate = vi.fn();
  const saveExamAnswer = vi.fn();
  const submitExamApi = vi.fn();
  const showConfirmCustom = vi.fn();
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
    saveExamAnswer,
    submitExamApi,
    showConfirmCustom,
  };
});

import QuizExamPage from "../QuizExamPage";
import { startExam as startExamApi } from "../../../services/dashboardService";

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
  showConfirmCustom,
}));

vi.mock("../../../hooks/useExamIntegrityMonitor", () => ({
  useExamIntegrityMonitor: vi.fn(),
}));

vi.mock("../../../services/dashboardService", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getStudentExams: vi.fn().mockResolvedValue({
      data: { data: [{ id: 1, has_ongoing_attempt: true }] },
    }),
    getCourseDetails: vi.fn(),
    recordExamQuestionTime: vi.fn().mockResolvedValue({ data: { status: "ok" } }),
    startExam: vi.fn().mockResolvedValue({
      data: { data: mockExam },
    }),
    saveExamAnswer,
    submitExam: submitExamApi,
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

describe("QuizExamPage header Exit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockNavigate.mockClear();
    showConfirmCustom.mockResolvedValue(true);
    saveExamAnswer.mockResolvedValue({ data: { status: "saved" } });
    submitExamApi.mockResolvedValue({
      data: {
        results: {
          score: 1,
          total_marks: 1,
          status: "passed",
          is_passed: true,
        },
      },
    });
    startExamApi.mockReset();
    startExamApi.mockResolvedValue({
      data: { data: mockExam },
    });
  });

  it("shows confirmation when Exit is clicked during an active attempt", async () => {
    const user = userEvent.setup();

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /quiz_exam.exit/i }));

    expect(showConfirmCustom).toHaveBeenCalledTimes(1);
  });

  it("does not navigate or submit when the student cancels leave", async () => {
    showConfirmCustom.mockResolvedValue(false);
    const user = userEvent.setup();

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /quiz_exam.exit/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(submitExamApi).not.toHaveBeenCalled();
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("finalizes and navigates only after successful confirmation", async () => {
    const user = userEvent.setup();

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Alpha"));
    await user.click(screen.getByRole("button", { name: /quiz_exam.exit/i }));

    await waitFor(() => {
      expect(saveExamAnswer).toHaveBeenCalled();
      expect(submitExamApi).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/student/quizzes", {
        state: { refreshQuizzes: true },
      });
    });

    expect(saveExamAnswer.mock.invocationCallOrder[0]).toBeLessThan(
      submitExamApi.mock.invocationCallOrder[0],
    );
  });

  it("does not navigate when finalization fails", async () => {
    submitExamApi.mockRejectedValue(
      Object.assign(new Error("submit failed"), { response: { status: 500 } }),
    );
    const user = userEvent.setup();

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /quiz_exam.exit/i }));

    await waitFor(() => {
      expect(submitExamApi).toHaveBeenCalledTimes(1);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("persists pending debounced answer through the leave finalization path", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();

    try {
      render(<QuizExamPage />);

      await waitFor(() => {
        expect(screen.getByText("Pick one")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Alpha"));
      expect(saveExamAnswer).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: /quiz_exam.exit/i }));

      await waitFor(() => {
        expect(saveExamAnswer).toHaveBeenCalledWith(
          expect.objectContaining({
            attempt_id: 42,
            question_id: 7,
            choice_id: 101,
          }),
        );
        expect(submitExamApi).toHaveBeenCalledTimes(1);
      });

      await vi.advanceTimersByTimeAsync(MCQ_AUTOSAVE_DEBOUNCE_MS);
      expect(saveExamAnswer).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not show the header Exit control while initialization is in progress", async () => {
    startExamApi.mockImplementation(() => new Promise(() => {}));

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /quiz_exam.exit/i }),
    ).not.toBeInTheDocument();
    expect(showConfirmCustom).not.toHaveBeenCalled();
  });

  it("uses direct navigation on the error state without leave confirmation", async () => {
    startExamApi.mockRejectedValue({
      response: { data: { message: "Exam unavailable" } },
    });
    const user = userEvent.setup();

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("Exam unavailable")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /quiz_exam.back/i }));

    expect(showConfirmCustom).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/student/quizzes", {
      state: { refreshQuizzes: true },
    });
  });

  it("submits exactly once on confirmed Exit", async () => {
    const user = userEvent.setup();

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /quiz_exam.exit/i }));

    await waitFor(() => {
      expect(submitExamApi).toHaveBeenCalledTimes(1);
    });
  });
});
