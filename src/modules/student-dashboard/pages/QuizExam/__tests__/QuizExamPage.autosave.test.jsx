import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MCQ_AUTOSAVE_DEBOUNCE_MS } from "../../../hooks/examAnswerSaveConstants";

const { mockNavigate, mockExam, saveExamAnswer } = vi.hoisted(() => {
  const mockNavigate = vi.fn();
  const saveExamAnswer = vi.fn();
  const mockExam = {
    attempt_id: 42,
    status: "ongoing",
    started_at: new Date().toISOString(),
    duration: 30,
    remaining_seconds: 1800,
    user_answers: {},
    questions: [
      {
        id: 7,
        type: "mcq",
        question_text: "Pick one",
        choices: [
          { id: 101, choice_text: "Alpha" },
          { id: 102, choice_text: "Beta" },
        ],
      },
      {
        id: 8,
        type: "essay",
        question_text: "Explain",
        choices: [],
      },
    ],
  };
  return { mockNavigate, mockExam, saveExamAnswer };
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
    submitExam: vi.fn(),
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

describe("QuizExamPage autosave", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    sessionStorage.clear();
    saveExamAnswer.mockResolvedValue({ data: { status: "saved" } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("schedules MCQ autosave without pressing Next", async () => {
    const user = userEvent.setup();

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Alpha"));

    expect(saveExamAnswer).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(MCQ_AUTOSAVE_DEBOUNCE_MS);

    await waitFor(() => {
      expect(saveExamAnswer).toHaveBeenCalledWith(
        expect.objectContaining({
          attempt_id: 42,
          question_id: 7,
          choice_id: 101,
        }),
      );
    });
  });

  it("clears dirty after coalesced debounced saves and not before newer revision persists", async () => {
    const user = userEvent.setup();

    let resolveInFlightSave;
    saveExamAnswer.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInFlightSave = () => resolve({ data: { status: "saved" } });
        }),
    );

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("Pick one")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Alpha"));
    await user.click(screen.getByText("Beta"));

    await vi.advanceTimersByTimeAsync(MCQ_AUTOSAVE_DEBOUNCE_MS);

    await waitFor(() => {
      expect(saveExamAnswer).toHaveBeenCalledTimes(1);
      expect(saveExamAnswer).toHaveBeenCalledWith(
        expect.objectContaining({
          attempt_id: 42,
          question_id: 7,
          choice_id: 102,
        }),
      );
    });

    await act(async () => {
      resolveInFlightSave();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText("Answer saved")).toBeInTheDocument();
    });

    const sessionAfterCoalesce = JSON.parse(
      sessionStorage.getItem("quiz_state_1") ?? "{}",
    );
    expect(sessionAfterCoalesce?.drafts?.[7]?.dirty).not.toBe(true);

    saveExamAnswer.mockClear();
    saveExamAnswer.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInFlightSave = () => resolve({ data: { status: "saved" } });
        }),
    );

    await user.click(screen.getByText("Alpha"));
    await vi.advanceTimersByTimeAsync(MCQ_AUTOSAVE_DEBOUNCE_MS);

    await waitFor(() => {
      expect(saveExamAnswer).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByText("Beta"));
    expect(screen.queryByText("Answer saved")).not.toBeInTheDocument();

    await act(async () => {
      resolveInFlightSave();
      await Promise.resolve();
    });

    expect(screen.queryByText("Answer saved")).not.toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(MCQ_AUTOSAVE_DEBOUNCE_MS);

    await waitFor(() => {
      expect(saveExamAnswer).toHaveBeenCalledTimes(2);
      expect(saveExamAnswer.mock.calls[1][0].choice_id).toBe(102);
    });

    await act(async () => {
      resolveInFlightSave();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText("Answer saved")).toBeInTheDocument();
    });
  });
});
