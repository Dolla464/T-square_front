import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import DashboardLayout from "../DashboardLayout";

let mockLanguage = "en";

const translations = {
  en: {
    "sidebar.quiz": "Quiz",
  },
  ar: {
    "sidebar.quiz": "الاختبارات",
  },
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => {
      const dict = mockLanguage.startsWith("ar") ? translations.ar : translations.en;
      return dict[key] ?? key;
    },
  }),
}));

vi.mock("../../../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: 1, name: "Student", role: "student" } }),
}));

vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/student/quizzes" }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  NavLink: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock("../../../../hooks/useNotifications", () => ({
  useUnreadCount: () => ({ unreadCount: 0 }),
}));

vi.mock("../../hooks/useCourses", () => ({
  getStudentCourses: () => ({ enrolledCourses: [], loading: false }),
}));

vi.mock("../../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout", () => ({
  default: ({ pageTitle }) => <div data-testid="layout-title">{pageTitle}</div>,
}));

describe("DashboardLayout locale UI", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it.each(["ar", "ar-EG", "ar-SA"])("uses Arabic dashboard title for %s", (language) => {
    mockLanguage = language;

    render(
      <DashboardLayout>
        <div>child</div>
      </DashboardLayout>,
    );

    expect(screen.getByTestId("layout-title")).toHaveTextContent("الاختبارات");
  });

  it("uses English quizzes title for en-US", () => {
    mockLanguage = "en-US";

    render(
      <DashboardLayout>
        <div>child</div>
      </DashboardLayout>,
    );

    expect(screen.getByTestId("layout-title")).toHaveTextContent("Quiz");
  });
});
