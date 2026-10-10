import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import LoginPage from "../LoginPage";

let mockLanguage = "en";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: mockLanguage },
  }),
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  Navigate: () => null,
  useLocation: () => ({ state: {} }),
}));

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("../../../hooks/useLogin", () => ({
  useLogin: () => ({ executeLogin: vi.fn(), loading: false }),
}));

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }) => <>{children}</>,
}));

describe("LoginPage locale UI", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it.each(["ar", "ar-EG", "ar-SA"])("uses RTL layout for %s", (language) => {
    mockLanguage = language;

    render(<LoginPage />);

    expect(document.querySelector(".login-wrapper")).toHaveAttribute("dir", "rtl");
  });

  it.each(["en", "en-US"])("uses LTR layout for %s", (language) => {
    mockLanguage = language;

    render(<LoginPage />);

    expect(document.querySelector(".login-wrapper")).toHaveAttribute("dir", "ltr");
  });
});
