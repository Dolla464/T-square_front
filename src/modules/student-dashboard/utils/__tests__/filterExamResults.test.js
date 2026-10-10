import { describe, expect, it } from "vitest";
import {
  computeExamResultsStats,
  filterExamResults,
  filterExamResultsByStatus,
  hasExamAttempts,
  isExamFailedFromList,
  isExamPassedFromList,
  matchesExamResultsSearch,
} from "../filterExamResults";

describe("filterExamResults helpers", () => {
  it("includes exams with has_attempt true", () => {
    expect(hasExamAttempts({ has_attempt: true })).toBe(true);
    expect(filterExamResults([{ id: 1, has_attempt: true }])).toHaveLength(1);
  });

  it("includes exams with attempts_count greater than zero", () => {
    expect(hasExamAttempts({ attempts_count: 2 })).toBe(true);
    expect(filterExamResults([{ id: 1, attempts_count: 1 }])).toHaveLength(1);
  });

  it("excludes exams without attempts", () => {
    expect(hasExamAttempts({ has_attempt: false, attempts_count: 0 })).toBe(false);
    expect(filterExamResults([{ id: 1, has_attempt: false, attempts_count: 0 }])).toHaveLength(0);
  });

  it("excludes zero attempts_count", () => {
    expect(hasExamAttempts({ attempts_count: 0 })).toBe(false);
  });

  it("handles malformed or missing optional fields without crashing", () => {
    expect(hasExamAttempts(null)).toBe(false);
    expect(hasExamAttempts(undefined)).toBe(false);
    expect(hasExamAttempts({})).toBe(false);
    expect(hasExamAttempts({ attempts_count: "invalid" })).toBe(false);
    expect(filterExamResults(null)).toEqual([]);
    expect(filterExamResultsByStatus(undefined, "all")).toEqual([]);
    expect(computeExamResultsStats(undefined)).toEqual({
      total: 0,
      passed: 0,
      failed: 0,
    });
    expect(matchesExamResultsSearch({}, "")).toBe(true);
  });

  it("derives passed and failed status from list API fields", () => {
    const passed = { id: 1, has_attempt: true, is_passed_before: true, is_locked: true };
    const failed = { id: 2, has_attempt: true, is_passed_before: false, is_locked: true };
    const attempted = { id: 3, has_attempt: true, is_passed_before: false, is_locked: false };

    expect(isExamPassedFromList(passed)).toBe(true);
    expect(isExamFailedFromList(failed)).toBe(true);
    expect(isExamFailedFromList(attempted)).toBe(false);

    expect(filterExamResultsByStatus([passed, failed, attempted], "passed")).toEqual([passed]);
    expect(filterExamResultsByStatus([passed, failed, attempted], "failed")).toEqual([failed]);
  });

  it("computes stats from attempted exams only", () => {
    const quizzes = [
      { id: 1, has_attempt: true, is_passed_before: true, is_locked: true },
      { id: 2, has_attempt: true, is_passed_before: false, is_locked: true },
      { id: 3, has_attempt: false, attempts_count: 0 },
    ];

    expect(computeExamResultsStats(quizzes)).toEqual({
      total: 2,
      passed: 1,
      failed: 1,
    });
  });

  it("matches search against exam title and course title", () => {
    const quiz = { title: "Final Exam", course_title: "Laravel Basics" };

    expect(matchesExamResultsSearch(quiz, "final")).toBe(true);
    expect(matchesExamResultsSearch(quiz, "laravel")).toBe(true);
    expect(matchesExamResultsSearch(quiz, "python")).toBe(false);
  });
});
