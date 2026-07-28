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
}) {
  const payload = {
    exam_id: examId,
    question_text: formatQuestionTextForPayload(questionText),
    question_image: questionImagePath || null,
    question_code: null,
    question_code_language: null,
    marks,
    choices: choices.map((choice) => ({
      choice_text: choice.choice_text,
      is_correct: !!choice.is_correct,
    })),
  };

  const trimmedCode = questionCode?.trim();
  if (trimmedCode) {
    payload.question_code = trimmedCode;
    payload.question_code_language = questionCodeLanguage || "code";
  }

  return payload;
}

export function isQuestionFormBlank({ questionText, questionImagePath, questionCode, choices }) {
  return (
    !questionText.trim() &&
    !questionImagePath &&
    !questionCode.trim() &&
    choices.every((choice) => !choice.choice_text.trim())
  );
}

export function resetQuestionRichFields(setters) {
  setters.setQuestionText("");
  setters.setQuestionImagePath("");
  setters.setQuestionImagePreview("");
  setters.setQuestionCode("");
  setters.setQuestionCodeLanguage("php");
  setters.setMarks(1.0);
  setters.setChoices([
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
  ]);
}
