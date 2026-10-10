import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const cssPath = path.resolve(
  import.meta.dirname,
  "../dashboardShared.css",
);

describe("dashboardShared Arabic result UI CSS", () => {
  it("removes uppercase and letter-spacing for RTL result titles", () => {
    const css = fs.readFileSync(cssPath, "utf8");

    expect(css).toMatch(
      /\[dir="rtl"\]\s*\.result-title[\s\S]*?text-transform:\s*none/,
    );
    expect(css).toMatch(
      /\[dir="rtl"\]\s*\.result-title[\s\S]*?letter-spacing:\s*normal/,
    );
    expect(css).toMatch(
      /\[dir="rtl"\]\s*\.quiz-modal-gauge-title[\s\S]*?text-transform:\s*none/,
    );
    expect(css).toMatch(
      /\[dir="rtl"\]\s*\.quiz-modal-gauge-title[\s\S]*?letter-spacing:\s*normal/,
    );
  });

  it("preserves English uppercase styling on base result title classes", () => {
    const css = fs.readFileSync(cssPath, "utf8");

    expect(css).toMatch(/\.result-title[\s\S]*?text-transform:\s*uppercase/);
    expect(css).toMatch(
      /\.quiz-modal-gauge-title[\s\S]*?text-transform:\s*uppercase/,
    );
  });
});
