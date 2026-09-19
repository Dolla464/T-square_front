import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import {
  QUESTION_CODE_LANGUAGES,
  QUESTION_TYPES,
  QUESTION_TYPE_MCQ,
  QUESTION_TYPE_ESSAY,
} from "../../utils/questionFormHelpers";
import "./questionEditorFields.css";

const TYPE_META = {
  [QUESTION_TYPE_MCQ]: {
    icon: "bi-ui-radios",
    descEn: "Four choices with one correct answer — auto-graded.",
    descAr: "أربعة خيارات مع إجابة صحيحة واحدة — تصحيح تلقائي.",
  },
  [QUESTION_TYPE_ESSAY]: {
    icon: "bi-pencil-square",
    descEn: "Free-text answer — instructor grades manually.",
    descAr: "إجابة نصية حرة — يصحّحها المدرّس يدوياً.",
  },
};

function QuestionEditorFields({
  isArabic,
  questionType,
  onQuestionTypeChange,
  typeLocked = false,
  questionText,
  onQuestionTextChange,
  marks,
  onMarksChange,
  questionImagePreview,
  onImageSelect,
  onImageRemove,
  uploadingImage = false,
  questionCode,
  onQuestionCodeChange,
  questionCodeLanguage,
  onQuestionCodeLanguageChange,
}) {
  const [imageOpen, setImageOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  useEffect(() => {
    if (questionImagePreview) {
      setImageOpen(true);
    }
  }, [questionImagePreview]);

  useEffect(() => {
    if (questionCode?.trim()) {
      setCodeOpen(true);
    }
  }, [questionCode]);

  return (
    <div className="question-editor-fields">
      <div className="mb-4 editor-panel p-3 rounded-3">
        <div className="question-editor-type-header">
          <label className="form-label fw-bold text-dark mb-0">
            {isArabic ? "نوع السؤال" : "Question Type"}
          </label>
          <div className="question-editor-marks-inline">
            <label
              className="form-label fw-bold text-dark mb-0"
              htmlFor="question-mark-input"
            >
              {isArabic ? "درجة السؤال" : "Question Mark"}
            </label>
            <input
              id="question-mark-input"
              type="number"
              step="1"
              className="form-control question-editor-marks-input"
              value={marks}
              onChange={(e) => onMarksChange(e.target.value)}
              min="0"
            />
          </div>
        </div>
        <div
          className="question-editor-type-group mt-3"
          role="radiogroup"
          aria-label={isArabic ? "نوع السؤال" : "Question Type"}
        >
          {QUESTION_TYPES.map((item) => {
            const meta = TYPE_META[item.value] ?? {};
            const isSelected = questionType === item.value;

            return (
              <label
                key={item.value}
                className={`question-editor-type-option ${
                  isSelected ? "question-editor-type-option--selected" : ""
                } ${typeLocked ? "question-editor-type-option--disabled" : ""}`}
              >
                <input
                  type="radio"
                  name="question-type"
                  className="question-editor-type-option__input"
                  value={item.value}
                  checked={isSelected}
                  disabled={typeLocked}
                  onChange={() => onQuestionTypeChange(item.value)}
                />
                <span className="question-editor-type-option__icon" aria-hidden="true">
                  <i className={`bi ${meta.icon}`} />
                </span>
                <span className="question-editor-type-option__body">
                  <span className="question-editor-type-option__title">
                    {isArabic ? item.labelAr : item.labelEn}
                  </span>
                  <span className="question-editor-type-option__desc">
                    {isArabic ? meta.descAr : meta.descEn}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {typeLocked ? (
          <p className="text-muted small mb-0 mt-3">
            {isArabic
              ? "لا يمكن تغيير نوع السؤال بعد أن يبدأ الطلاب بالإجابة عليه."
              : "Question type cannot be changed after students have answered."}
          </p>
        ) : null}
      </div>

      <div className="mb-4 quiz-question editor-panel editor-panel--question d-flex align-items-stretch gap-2">
        <textarea
          className="form-control border-0 bg-transparent fw-bold flex-grow-1 question-editor-textarea"
          placeholder={
            isArabic
              ? "اكتب نص السؤال هنا..."
              : "Type the question text here..."
          }
          value={questionText}
          onChange={(e) => onQuestionTextChange(e.target.value.replace(/\?+$/, ""))}
          rows={3}
        />
        <div
          className="bg-danger rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm editor-icon-badge align-self-start"
          style={{ width: "40px", height: "40px", flexShrink: 0 }}
          title={
            isArabic
              ? "علامة الاستفهام تُضاف تلقائياً عند الحفظ"
              : "Question mark is added automatically on save"
          }
        >
          <i className="bi bi-question-lg text-white"></i>
        </div>
      </div>

      <div className="question-editor-optional-toggles mb-3">
        <button
          type="button"
          className={`question-editor-optional-toggle ${
            imageOpen ? "question-editor-optional-toggle--active" : ""
          } ${questionImagePreview ? "question-editor-optional-toggle--filled" : ""}`}
          onClick={() => setImageOpen((open) => !open)}
          aria-expanded={imageOpen}
        >
          <i className="bi bi-image" />
          <span>{isArabic ? "صورة السؤال" : "Question Image"}</span>
          {questionImagePreview ? (
            <i className="bi bi-check-circle-fill question-editor-optional-toggle__check" />
          ) : (
            <i className={`bi ${imageOpen ? "bi-chevron-up" : "bi-plus-lg"}`} />
          )}
        </button>

        <button
          type="button"
          className={`question-editor-optional-toggle ${
            codeOpen ? "question-editor-optional-toggle--active" : ""
          } ${questionCode?.trim() ? "question-editor-optional-toggle--filled" : ""}`}
          onClick={() => setCodeOpen((open) => !open)}
          aria-expanded={codeOpen}
        >
          <i className="bi bi-code-slash" />
          <span>{isArabic ? "كود السؤال" : "Question Code"}</span>
          {questionCode?.trim() ? (
            <i className="bi bi-check-circle-fill question-editor-optional-toggle__check" />
          ) : (
            <i className={`bi ${codeOpen ? "bi-chevron-up" : "bi-plus-lg"}`} />
          )}
        </button>
      </div>

      {(imageOpen || codeOpen) && (
        <div className="row g-3 mb-4 question-editor-optional-panels">
          {imageOpen ? (
            <div className={codeOpen ? "col-md-6" : "col-12"}>
              <div className="p-3 editor-panel rounded-3 h-100 question-editor-optional-panel">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-bold text-dark mb-0">
                    {isArabic ? "صورة السؤال" : "Question Image"}
                  </label>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-muted question-editor-panel-close"
                    onClick={() => setImageOpen(false)}
                    aria-label={isArabic ? "إخفاء" : "Hide"}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="form-control mb-2"
                  onChange={onImageSelect}
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <Spinner animation="border" size="sm" />
                    {isArabic ? "جاري رفع الصورة..." : "Uploading image..."}
                  </div>
                ) : null}
                {questionImagePreview ? (
                  <div className="mt-2">
                    <img
                      src={questionImagePreview}
                      alt={isArabic ? "معاينة صورة السؤال" : "Question image preview"}
                      className="question-content-image"
                      style={{ maxHeight: "220px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={onImageRemove}
                    >
                      {isArabic ? "إزالة الصورة" : "Remove image"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {codeOpen ? (
            <div className={imageOpen ? "col-md-6" : "col-12"}>
              <div className="p-3 editor-panel rounded-3 h-100 question-editor-optional-panel">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-bold text-dark mb-0">
                    {isArabic ? "كود السؤال" : "Question Code"}
                  </label>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-muted question-editor-panel-close"
                    onClick={() => setCodeOpen(false)}
                    aria-label={isArabic ? "إخفاء" : "Hide"}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
                <select
                  className="form-select mb-2"
                  value={questionCodeLanguage}
                  onChange={(e) => onQuestionCodeLanguageChange(e.target.value)}
                >
                  {QUESTION_CODE_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <textarea
                  className="form-control font-monospace"
                  rows={8}
                  placeholder={
                    isArabic ? "الصق أو اكتب الكود هنا..." : "Paste or type code here..."
                  }
                  value={questionCode}
                  onChange={(e) => onQuestionCodeChange(e.target.value)}
                  dir="ltr"
                  spellCheck={false}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default QuestionEditorFields;
