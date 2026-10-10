import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import QuizExamPage from "../QuizExamPage";

const mockNavigate = vi.fn();

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
  getStudentExams: vi.fn().mockRejectedValue(new Error("network")),
  getCourseDetails: vi.fn(),
  recordExamQuestionTime: vi.fn(),
}));

let mockLanguage = "en";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: mockLanguage },
  }),
}));

vi.mock("../../../hooks/useExam", () => ({
  mapExamResults: (results) => results,
  useExam: () => ({
    exam: null,
    loading: false,
    error: null,
    startExam: vi.fn().mockResolvedValue(undefined),
    saveAnswer: vi.fn(),
    submitExam: vi.fn(),
    submitting: false,
    isSavingAnswer: false,
    recoverClosedAttempt: vi.fn(),
    syncExamTime: vi.fn(),
  }),
}));

describe("QuizExamPage locale UI", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLanguage = "en";
  });

  it.each(["ar", "ar-EG", "ar-SA"])("uses i18n keys for error UI in %s", async (language) => {
    mockLanguage = language;

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("quiz_exam.not_found")).toBeInTheDocument();
    });
    expect(screen.getByText("quiz_exam.back")).toBeInTheDocument();
  });

  it.each(["en", "en-US"])("uses i18n keys for error UI in %s", async (language) => {
    mockLanguage = language;

    render(<QuizExamPage />);

    await waitFor(() => {
      expect(screen.getByText("quiz_exam.not_found")).toBeInTheDocument();
    });
    expect(screen.getByText("quiz_exam.back")).toBeInTheDocument();
  });
});
