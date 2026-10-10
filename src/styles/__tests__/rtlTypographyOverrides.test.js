import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const cssPath = path.resolve(import.meta.dirname, "../rtlTypographyOverrides.css");
const dashboardCssPath = path.resolve(
  import.meta.dirname,
  "../../modules/student-dashboard/styles/dashboardShared.css",
);

describe("RTL typography overrides", () => {
  it("defines global RTL overrides for shared uppercase labels", () => {
    const css = fs.readFileSync(cssPath, "utf8");

    expect(css).toMatch(/\[dir="rtl"\]\s*\.attendance-hero-label[\s\S]*text-transform:\s*none/);
    expect(css).toMatch(/\[dir="rtl"\]\s*\.faq-header span[\s\S]*letter-spacing:\s*normal/);
    expect(css).toMatch(/\[dir="rtl"\]\s*\.hero-lang-section-title/);
  });

  it("preserves exam result RTL overrides in dashboardShared.css", () => {
    const css = fs.readFileSync(dashboardCssPath, "utf8");

    expect(css).toMatch(/\[dir="rtl"\]\s*\.result-title[\s\S]*text-transform:\s*none/);
    expect(css).toMatch(
      /\[dir="rtl"\]\s*\.quiz-modal-gauge-title[\s\S]*letter-spacing:\s*normal/,
    );
  });
});
