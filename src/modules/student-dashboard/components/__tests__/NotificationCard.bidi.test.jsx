import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NotificationCard from "../NotificationCard";

const mockNavigate = vi.fn();
const mockMarkAsRead = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../../../hooks/useNotifications", () => ({
  useNotifications: () => ({ markAsRead: mockMarkAsRead }),
}));

vi.mock("../../shared-dashboard/components/NotificationDetails/NotificationDetails", () => ({
  default: () => null,
}));

const arabicTitle = "تم تأكيد التسجيل في React 101";
const arabicMessage = "يمكنك الآن متابعة الكورس رقم 12";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "ar" },
  }),
}));

describe("NotificationCard bidi", () => {
  it("does not force ltr on the card and uses dir=auto on title and message", () => {
    render(
      <NotificationCard
        notification={{
          id: 1,
          type: "custom",
          created_at: "2026-01-15T10:00:00Z",
          is_read: false,
          title: arabicTitle,
          message: arabicMessage,
        }}
      />,
    );

    const card = screen.getByText(arabicTitle).closest(".notification-card");
    expect(card).not.toHaveAttribute("dir", "ltr");

    expect(screen.getByText(arabicTitle)).toHaveAttribute("dir", "auto");
    expect(screen.getByText(arabicMessage)).toHaveAttribute("dir", "auto");
  });

  it("keeps formatted date in an ltr span", () => {
    render(
      <NotificationCard
        notification={{
          id: 2,
          type: "custom",
          created_at: "2026-01-15T10:00:00Z",
          is_read: true,
          title: arabicTitle,
          message: arabicMessage,
        }}
      />,
    );

    const timeSpan = screen.getByText(arabicTitle)
      .closest(".notification-card")
      .querySelector(".notification-time span");
    expect(timeSpan).toHaveAttribute("dir", "ltr");
  });
});
