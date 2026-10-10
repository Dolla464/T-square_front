import { describe, expect, it } from "vitest";
import en from "../en/studentDashboard.json";
import ar from "../ar/studentDashboard.json";

const requiredKeys = [
  "sidebar.examResults",
  "exam_results.page_title",
  "exam_results.section_title",
  "exam_results.empty",
  "exam_results.empty_cta",
  "exam_results.detail_title",
  "exam_results.back_to_list",
  "exam_results.not_found",
  "exam_results.stats.total",
  "exam_results.stats.passed",
  "exam_results.stats.failed",
  "exam_results.filters.all",
  "exam_results.filters.passed",
  "exam_results.filters.failed",
  "attempt_review.back_to_exam_results",
];

function getNestedValue(object, path) {
  return path.split(".").reduce((current, key) => current?.[key], object);
}

describe("studentDashboard exam results i18n", () => {
  it.each(requiredKeys)("includes %s in English and Arabic locales", (key) => {
    expect(getNestedValue(en, key)).toBeTruthy();
    expect(getNestedValue(ar, key)).toBeTruthy();
  });
});
