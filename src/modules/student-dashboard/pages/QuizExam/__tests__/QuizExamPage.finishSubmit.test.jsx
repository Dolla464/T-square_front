import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  mockNavigate,
  mockExam,
  saveExamAnswer,
  submitExamApi,
  getAttemptReview,
} = vi.hoisted(() => {
  const mockNavigate = vi.fn();
  const saveExamAnswer = vi.fn();
  const submitExamApi = vi.fn();
  const getAttemptReview = vi.fn();
  const mockExam = {
    attempt_id: 42,
    status: "ongoing",
    started_at: new Date().toISOString(),
    duration_minutes: 30,
    remaining_seconds: 1800,
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
    getAttemptReview,
  };
});

import QuizExamPage from "../QuizExamPage";

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
  confirmLeaveExam: vi.fn(),
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
    getAttemptReview,
    recordExamJourneyEvents: vi.fn(),
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en" },
  }),
}));

describe("QuizExamPage finish submit path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockNavigate.mockClear();

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

    getAttemptReview.mockResolvedValue({
      data: { data: { status: "ongoing" } },
    });
  });

  it("persists the current answer before submitting on Finish", async () => {
    const user = userEvent.setup();

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Alpha"));
    await user.click(screen.getByRole("button", { name: /quiz_exam.finish/i }));

    await waitFor(() => {
      expect(saveExamAnswer).toHaveBeenCalled();
      expect(submitExamApi).toHaveBeenCalled();
    });

    expect(saveExamAnswer.mock.invocationCallOrder[0]).toBeLessThan(
      submitExamApi.mock.invocationCallOrder[0],
    );
    expect(submitExamApi).toHaveBeenCalledTimes(1);
  });

  it("retries Finish after submit failure without duplicate concurrent submits", async () => {
    const user = userEvent.setup();
    const submitError = Object.assign(new Error("submit failed"), {
      response: { status: 500 },
    });

    submitExamApi
      .mockRejectedValueOnce(submitError)
      .mockResolvedValueOnce({
        data: {
          results: {
            score: 1,
            total_marks: 1,
            status: "passed",
            is_passed: true,
          },
        },
      });

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Alpha"));
    const finishButton = screen.getByRole("button", {
      name: /quiz_exam.finish/i,
    });

    await user.click(finishButton);

    await waitFor(() => {
      expect(submitExamApi).toHaveBeenCalledTimes(1);
    });

    expect(saveExamAnswer).toHaveBeenCalledTimes(1);

    const storedAfterFail = JSON.parse(
      sessionStorage.getItem("quiz_state_1") ?? "{}",
    );
    expect(storedAfterFail.savedAnswers?.[7]).toBe(101);

    await waitFor(() => {
      expect(finishButton).not.toBeDisabled();
    });

    await user.click(finishButton);

    await waitFor(() => {
      expect(submitExamApi).toHaveBeenCalledTimes(2);
      expect(saveExamAnswer).toHaveBeenCalledTimes(2);
    });

    expect(saveExamAnswer.mock.invocationCallOrder[0]).toBeLessThan(
      submitExamApi.mock.invocationCallOrder[0],
    );
    expect(saveExamAnswer.mock.invocationCallOrder[1]).toBeLessThan(
      submitExamApi.mock.invocationCallOrder[1],
    );
  });
});
