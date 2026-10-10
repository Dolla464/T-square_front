/**
 * BCP-47 Arabic language tags: "ar" or "ar-*" (also "ar_*" for legacy forms).
 * Intentionally does not match unrelated strings such as "arbitrary".
 */
const ARABIC_LOCALE_PATTERN = /^ar(?:[-_].+)?$/i;

export function isArabicLocale(language) {
  if (language == null || typeof language !== "string") {
    return false;
  }

  const normalized = language.trim();
  if (!normalized) {
    return false;
  }

  return ARABIC_LOCALE_PATTERN.test(normalized);
}
