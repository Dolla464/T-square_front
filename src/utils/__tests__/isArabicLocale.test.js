import { describe, expect, it } from "vitest";
import { isArabicLocale } from "../isArabicLocale";

describe("isArabicLocale", () => {
  it.each(["ar", "ar-EG", "ar-SA", "ar-AE", "AR", "AR-eg", " ar-EG ", "ar_Latn"])(
    "returns true for %s",
    (language) => {
      expect(isArabicLocale(language)).toBe(true);
    },
  );

  it.each([
    "en",
    "en-US",
    "EN",
    "fr",
    "",
    "   ",
    "arbitrary",
    "archive",
    "arg",
    "ar-",
    "ar_",
    undefined,
    null,
  ])("returns false for %s", (language) => {
    expect(isArabicLocale(language)).toBe(false);
  });
});
