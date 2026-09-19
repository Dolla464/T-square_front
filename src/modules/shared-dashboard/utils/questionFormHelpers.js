export const QUESTION_TYPE_MCQ = "mcq";
export const QUESTION_TYPE_ESSAY = "essay";
export const DEFAULT_QUESTION_MARKS = 0;
export const MIN_QUESTION_MARKS = 1;

export const QUESTION_TYPES = [
  { value: QUESTION_TYPE_MCQ, labelEn: "Multiple Choice", labelAr: "اختيار من متعدد" },
  { value: QUESTION_TYPE_ESSAY, labelEn: "Essay / Free Text", labelAr: "مقالي / نص حر" },
];

export const QUESTION_CODE_LANGUAGES = [
  { value: "php", label: "PHP" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
];

export function formatQuestionTextForPayload(questionText) {
  const trimmed = questionText.trim();
  if (!trimmed) return null;

  return trimmed.endsWith("?") ? trimmed : `${trimmed}?`;
}

export function resolveQuestionImageUrl(question) {
  if (!question) return null;

  if (question.question_image_url) {
    return question.question_image_url;
  }

  const image = question.question_image;
  if (!image) return null;

  if (/^https?:\/\//i.test(image) || image.startsWith("blob:")) {
    return image;
  }

  const base = (
    window.APP_CONFIG?.API_URL ||
    import.meta.env.VITE_API_URL ||
    "http://t-square-lms.test/api"
  )
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  const path = image.startsWith("/") ? image.slice(1) : image;
  if (path.startsWith("storage/")) {
    return `${base}/${path}`;
  }

  return `${base}/storage/${path}`;
}

export function hasQuestionContent({ questionText, questionImage, questionCode }) {
  return Boolean(
    questionText?.trim() ||
      questionImage?.trim?.() ||
      questionImage ||
      questionCode?.trim(),
  );
}

export function buildQuestionPayload({
  examId,
  questionText,
  questionImage,
  questionImagePath,
  questionCode,
  questionCodeLanguage,
  marks,
  choices,
  type = QUESTION_TYPE_MCQ,
}) {
  const payload = {
    exam_id: examId,
    type,
    question_text: formatQuestionTextForPayload(questionText),
    question_image: questionImagePath || null,
    question_code: null,
    question_code_language: null,
    marks,
  };

  if (type === QUESTION_TYPE_MCQ) {
    payload.choices = choices.map((choice) => ({
      choice_text: choice.choice_text,
      is_correct: !!choice.is_correct,
    }));
  }

  const trimmedCode = questionCode?.trim();
  if (trimmedCode) {
    payload.question_code = trimmedCode;
    payload.question_code_language = questionCodeLanguage || "code";
  }

  return payload;
}

export function getQuestionFormValidationError({
  questionType = QUESTION_TYPE_MCQ,
  questionText,
  marks,
  choices = [],
}) {
  const numericMarks = Number(marks);
  const marksMissing =
    marks === "" ||
    marks === null ||
    marks === undefined ||
    Number.isNaN(numericMarks) ||
    numericMarks < MIN_QUESTION_MARKS ||
    !Number.isInteger(numericMarks);

  if (marksMissing) {
    return {
      en:
        numericMarks === 0
          ? "Question mark is missing — enter at least 1"
          : "Please enter a valid question mark (minimum 1)",
      ar:
        numericMarks === 0
          ? "لم تُدخل درجة السؤال — أدخل 1 على الأقل"
          : "من فضلك أدخل درجة صحيحة للسؤال (1 على الأقل)",
    };
  }

  if (!questionText?.trim()) {
    return {
      en: "Enter the question text before saving",
      ar: "أدخل نص السؤال قبل الحفظ",
    };
  }

  if (questionType === QUESTION_TYPE_MCQ) {
    const emptyChoiceIndexes = choices
      .map((choice, index) => (!choice.choice_text?.trim() ? index + 1 : null))
      .filter(Boolean);

    if (emptyChoiceIndexes.length > 0) {
      return {
        en: "Fill in all answer choices before saving",
        ar: "املأ جميع خيارات الإجابة قبل الحفظ",
      };
    }

    if (!choices.some((choice) => choice.is_correct)) {
      return {
        en: "Select the correct answer for this question",
        ar: "حدد الإجابة الصحيحة للسؤال",
      };
    }
  }

  return null;
}

export function isQuestionFormBlank({
  questionText,
  questionImagePath,
  questionCode,
  choices,
  type = QUESTION_TYPE_MCQ,
}) {
  const baseBlank =
    !questionText.trim() && !questionImagePath && !questionCode.trim();

  if (type === QUESTION_TYPE_ESSAY) {
    return baseBlank;
  }

  return baseBlank && choices.every((choice) => !choice.choice_text.trim());
}

export function resetQuestionRichFields(setters) {
  setters.setQuestionText("");
  setters.setQuestionImagePath("");
  setters.setQuestionImagePreview("");
  setters.setQuestionCode("");
  setters.setQuestionCodeLanguage("php");
  setters.setQuestionType?.(QUESTION_TYPE_MCQ);
  setters.setMarks(DEFAULT_QUESTION_MARKS);
  setters.setChoices([
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
  ]);
}
