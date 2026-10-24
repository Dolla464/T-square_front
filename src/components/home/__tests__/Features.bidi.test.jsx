import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Features from "../Features";

const arabicItems = [
  { title: "مسارات عملية", desc: "تعلم مع مشاريع حقيقية و React" },
  { title: "دعم مستمر", desc: "فريق يرافقك حتى الإتقان" },
  { title: "محتوى محدث", desc: "مواكبة لسوق العمل 2026" },
  { title: "شهادات", desc: "اعتماد بعد إتمام المسار" },
  { title: "مجتمع", desc: "تواصل مع المتعلمين" },
  { title: "مرونة", desc: "أونلاين وحضوري" },
];

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (key === "items" && opts?.returnObjects) {
        return arabicItems;
      }
      return key;
    },
  }),
}));

describe("Features bidi", () => {
  it("does not force ltr on layout columns and uses dir=auto on feature text", () => {
    render(<Features />);

    const titles = screen.getAllByText("مسارات عملية");
    expect(titles.length).toBeGreaterThan(0);
    for (const title of titles) {
      expect(title).toHaveAttribute("dir", "auto");
      expect(title.closest('[dir="ltr"]')).toBeNull();
    }

    expect(document.querySelectorAll(".feature-desc[dir='auto']").length).toBe(
      arabicItems.length * 2,
    );
    expect(document.querySelectorAll('[dir="ltr"]').length).toBe(0);
  });
});
