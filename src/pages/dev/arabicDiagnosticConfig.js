/** Known-good Unicode test strings — not from API. */

export const TEST_STRINGS = {
  A: {
    id: "A",
    label: "String A — simple Arabic",
    text: "مرحبا بكم في الاختبار",
  },
  B: {
    id: "B",
    label: "String B — Arabic with punctuation",
    text: "ما هو الاختيار الصحيح؟",
  },
  C: {
    id: "C",
    label: "String C — Arabic + Latin + numbers",
    text: "اختر الإجابة الصحيحة للسؤال رقم 10 من A إلى D.",
  },
  D: {
    id: "D",
    label: "String D — realistic exam question",
    text:
      "اشرح ب\u0627\u062e\u062a\u0635\u0627\u0631 كيف يعمل Virtual DOM في React، ثم اختر العبارة التي تصف الفرق بين state و props بشكل صحيح.",
  },
};

export const STRING_E_LINES = [
  "الإجابة الأولى",
  "الإجابة الثانية",
  "الإجابة الثالثة",
  "الإجابة الرابعة",
];

export const MIXED_CHOICE_LINES = [
  "A. الإجابة الأولى",
  "B. الإجابة الثانية",
  "C. الإجابة الثالثة",
  "D. الإجابة الرابعة",
];

export const NUMBER_TEST_1 =
  "السؤال رقم 25: اختر الإجابة الصحيحة من الاختيارات التالية.";

export const NUMBER_TEST_2 =
  "25. الإجابة الصحيحة هي الاختيار B.";

export const LONG_ARABIC_PARAGRAPH =
  "في هذا الاختبار، يُطلب من الطالب قراءة نص السؤال بعناية قبل اختيار الإجابة. تأكد من فهم جميع الكلمات، خاصةً عند وجود أرقام أو رموز لاتينية داخل الجملة العربية، لأن ذلك قد يغيّر ترتيب العرض على بعض الأجهزة دون تغيير النص نفسه في الذاكرة.";

export const CAIRO_FONT_STACK = '"Cairo", "Inter", "Tajawal", sans-serif';

/** Typography bypass — local to diagnostic elements only. */
export const BYPASS_TYPOGRAPHY_STYLE = {
  fontFamily: "system-ui, sans-serif",
  fontVariationSettings: "normal",
  fontSynthesis: "auto",
  textRendering: "auto",
  letterSpacing: "normal",
  wordSpacing: "normal",
};

export const VARIANTS = [
  {
    key: "v1",
    index: 1,
    title: "Current-like (inherited dir & font)",
    dir: undefined,
    style: {},
  },
  {
    key: "v2",
    index: 2,
    title: 'dir="auto"',
    dir: "auto",
    style: {},
  },
  {
    key: "v3",
    index: 3,
    title: 'dir="rtl"',
    dir: "rtl",
    style: {},
  },
  {
    key: "v4",
    index: 4,
    title: 'dir="ltr"',
    dir: "ltr",
    style: {},
  },
  {
    key: "v5",
    index: 5,
    title: "System font (typography bypass)",
    dir: undefined,
    style: BYPASS_TYPOGRAPHY_STYLE,
  },
  {
    key: "v6",
    index: 6,
    title: "Cairo (app stack)",
    dir: undefined,
    style: { fontFamily: CAIRO_FONT_STACK },
  },
  {
    key: "v7",
    index: 7,
    title: 'Cairo + dir="auto"',
    dir: "auto",
    style: { fontFamily: CAIRO_FONT_STACK },
  },
  {
    key: "v8",
    index: 8,
    title: 'Cairo + dir="rtl"',
    dir: "rtl",
    style: { fontFamily: CAIRO_FONT_STACK },
  },
];

export const MIXED_DIR_VARIANTS = [
  { key: "m-inherit", title: "Inherited direction", dir: undefined },
  { key: "m-auto", title: 'dir="auto"', dir: "auto" },
  { key: "m-rtl", title: 'dir="rtl"', dir: "rtl" },
  { key: "m-ltr", title: 'dir="ltr"', dir: "ltr" },
];

export const PASTE_VARIANTS = [
  { key: "p-current", title: "Current-like", dir: undefined, style: {} },
  { key: "p-auto", title: 'dir="auto"', dir: "auto", style: {} },
  { key: "p-rtl", title: 'dir="rtl"', dir: "rtl", style: {} },
  {
    key: "p-system",
    title: "System (bypass)",
    dir: undefined,
    style: BYPASS_TYPOGRAPHY_STYLE,
  },
  {
    key: "p-cairo",
    title: "Cairo",
    dir: undefined,
    style: { fontFamily: CAIRO_FONT_STACK },
  },
];

export function formatCodePoints(str) {
  if (!str) return "";
  return [...str]
    .map(
      (ch) =>
        `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
    )
    .join(" ");
}

export function readComputedSnapshot(el) {
  if (!el || typeof getComputedStyle !== "function") return null;
  const cs = getComputedStyle(el);
  return {
    fontFamily: cs.fontFamily,
    direction: cs.direction,
    unicodeBidi: cs.unicodeBidi,
    letterSpacing: cs.letterSpacing,
    wordSpacing: cs.wordSpacing,
    fontVariationSettings: cs.fontVariationSettings,
    fontSynthesis: cs.fontSynthesis,
    textRendering: cs.textRendering,
  };
}
