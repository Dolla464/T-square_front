import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import GoogleStorageAccounts from "../GoogleStorageAccounts";

let mockLanguage = "en";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key) => {
        const en = {
          "google_storage_page.title": "Google Storage Accounts",
          "google_storage_page.subtitle":
            "Connect multiple Google Drive accounts and assign them to courses.",
          "google_storage_page.add_account": "Add Account",
          "google_storage_page.col_name": "Name",
          "google_storage_page.col_email": "Email",
          "google_storage_page.col_status": "Status",
          "google_storage_page.col_courses": "Courses",
          "google_storage_page.col_last_check": "Last Check",
          "google_storage_page.col_actions": "Actions",
          "google_storage_page.status_connected": "Connected",
          "google_storage_page.status_disconnected": "Disconnected",
          "google_storage_page.status_pending": "Pending",
          "google_storage_page.reconnect": "Reconnect",
          "google_storage_page.test": "Test",
          "google_storage_page.disconnect": "Disconnect",
          "google_storage_page.cannot_delete_assigned":
            "Cannot delete — assigned to {{count}} course(s)",
        };
        const ar = {
          "google_storage_page.title": "حسابات Google Storage",
          "google_storage_page.subtitle":
            "اربط حسابات Google Drive متعددة وعيّنها للكورسات.",
          "google_storage_page.add_account": "إضافة حساب",
          "google_storage_page.col_name": "الاسم",
          "google_storage_page.col_email": "البريد",
          "google_storage_page.col_status": "الحالة",
          "google_storage_page.col_courses": "الكورسات",
          "google_storage_page.col_last_check": "آخر فحص",
          "google_storage_page.col_actions": "إجراءات",
          "google_storage_page.status_connected": "متصل",
          "google_storage_page.status_disconnected": "غير متصل",
          "google_storage_page.status_pending": "قيد الانتظار",
          "google_storage_page.reconnect": "إعادة الربط",
          "google_storage_page.test": "اختبار",
          "google_storage_page.disconnect": "فصل",
          "google_storage_page.cannot_delete_assigned":
            "لا يمكن الحذف — مرتبط بـ {{count}} كورس",
        };
        const dict = mockLanguage.startsWith("ar") ? ar : en;
        const value = dict[key] ?? key;
        if (typeof value === "string" && key.includes("cannot_delete")) {
          return value.replace("{{count}}", "2");
        }
        return value;
      },
      i18n: { language: mockLanguage },
    }),
  };
});

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [new URLSearchParams()],
}));

vi.mock("../../../hooks/useGoogleStorageAccounts", () => ({
  useGoogleStorageAccounts: () => ({
    accounts: [
      {
        id: 1,
        name: "Primary",
        email: "storage@example.com",
        status: "connected",
        courses_count: 2,
        last_checked_at: null,
      },
    ],
    loading: false,
    fetchAccounts: vi.fn(),
    createAccount: vi.fn(),
    removeAccount: vi.fn(),
    connectAccount: vi.fn(),
    disconnectAccount: vi.fn(),
    testConnection: vi.fn(),
  }),
}));

describe("GoogleStorageAccounts admin locale UI", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it.each(["ar", "ar-EG", "ar-SA"])(
    "renders Arabic admin labels when lang is %s",
    (language) => {
      mockLanguage = language;

      render(<GoogleStorageAccounts />);

      expect(screen.getByText("حسابات Google Storage")).toBeInTheDocument();
      expect(screen.getByText("متصل")).toBeInTheDocument();
    },
  );

  it("renders English admin labels for en-US", () => {
    mockLanguage = "en-US";

    render(<GoogleStorageAccounts />);

    expect(screen.getByText("Google Storage Accounts")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });
});
