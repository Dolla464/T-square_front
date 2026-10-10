import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import VerifyEmailPage from "../VerifyEmailPage";

let mockLanguage = "ar";
let mockSearchParams = new URLSearchParams();
let mockUser = { id: 1, is_verified: true };

const arAuth = {
  "verify_email.success_title": "تم التفعيل بنجاح!",
  "verify_email.success_message":
    "لقد تم تفعيل حسابك بنجاح. سيتم توجيهك إلى لوحة التحكم الآن.",
  "verify_email.error_title": "فشل التفعيل",
  "verify_email.resend_link": "إعادة إرسال رابط التفعيل",
  "verify_email.invalid_link": "رابط التفعيل غير صالح أو غير مكتمل.",
  "back_to_home": "العودة للرئيسية",
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => arAuth[key] ?? key,
    i18n: { language: mockLanguage },
  }),
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/verify-email", search: "" }),
  useSearchParams: () => [mockSearchParams],
}));

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    authInitializing: false,
    userSynced: true,
    updateUser: vi.fn(),
  }),
}));

vi.mock("../../../services/register", () => ({
  verifyEmail: vi.fn(),
  resendVerificationNotification: vi.fn(),
}));

vi.mock("../../../components/shared/Toaster/toaster", () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(__dirname, "../VerifyEmailPage.jsx");
const MOJIBAKE_PATTERN = /[ØÙÚÛÝÞ]/;

describe("VerifyEmailPage Arabic source integrity", () => {
  it("does not contain mojibake sequences in source", () => {
    const source = fs.readFileSync(sourcePath, "utf8");
    expect(source).not.toMatch(MOJIBAKE_PATTERN);
  });
});

describe("VerifyEmailPage Arabic UI", () => {
  beforeEach(() => {
    mockLanguage = "ar";
    mockSearchParams = new URLSearchParams();
    mockUser = { id: 1, is_verified: true };
  });

  it("renders success state with real Arabic text", () => {
    render(<VerifyEmailPage />);

    expect(
      screen.getByText("لقد تم تفعيل حسابك بنجاح. سيتم توجيهك إلى لوحة التحكم الآن."),
    ).toBeInTheDocument();
    expect(screen.getByText("تم التفعيل بنجاح!")).toBeInTheDocument();
  });

  it("renders error state with real Arabic text", () => {
    mockUser = { id: 1, is_verified: false };

    render(<VerifyEmailPage />);

    expect(screen.getByText("فشل التفعيل")).toBeInTheDocument();
    expect(screen.getByText("إعادة إرسال رابط التفعيل")).toBeInTheDocument();
    expect(screen.getByText("رابط التفعيل غير صالح أو غير مكتمل.")).toBeInTheDocument();
  });

  it("uses RTL layout for Arabic locale", () => {
    render(<VerifyEmailPage />);

    expect(document.querySelector(".login-wrapper")).toHaveAttribute("dir", "rtl");
  });
});
