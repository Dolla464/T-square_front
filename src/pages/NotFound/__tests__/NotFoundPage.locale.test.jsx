import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import NotFoundPage from "../NotFoundPage";

let mockLanguage = "en";

const translations = {
  en: {
    "notFound.page_title": "Page Not Found!",
    "notFound.message":
      "Sorry, the page you are looking for does not exist or has been moved.",
    "notFound.go_to_home": "Go to Home Page",
    "notFound.go_back": "Go Back",
    "notFound.back_to_home": "Back to Home",
  },
  ar: {
    "notFound.page_title": "الصفحة غير موجودة!",
    "notFound.message":
      "عذراً، الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله.",
    "notFound.go_to_home": "العودة للرئيسية",
    "notFound.go_back": "العودة للصفحة السابقة",
    "notFound.back_to_home": "العودة للرئيسية",
  },
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => {
      const dict = mockLanguage.startsWith("ar") ? translations.ar : translations.en;
      return dict[key] ?? key;
    },
    i18n: { language: mockLanguage },
  }),
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

describe("NotFoundPage locale UI", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it.each(["ar", "ar-EG"])("shows Arabic copy for %s", (language) => {
    mockLanguage = language;

    render(<NotFoundPage />);

    expect(screen.getByText("الصفحة غير موجودة!")).toBeInTheDocument();
    expect(document.querySelector(".notfound-wrapper")).toHaveAttribute("dir", "rtl");
  });

  it("shows English copy for en-US", () => {
    mockLanguage = "en-US";

    render(<NotFoundPage />);

    expect(screen.getByText("Page Not Found!")).toBeInTheDocument();
    expect(document.querySelector(".notfound-wrapper")).toHaveAttribute("dir", "ltr");
  });
});
