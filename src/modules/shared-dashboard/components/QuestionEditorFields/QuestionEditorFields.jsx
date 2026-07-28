import { Spinner } from "react-bootstrap";
import { QUESTION_CODE_LANGUAGES } from "../../utils/questionFormHelpers";

function QuestionEditorFields({
  isArabic,
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
  return (
    <>
      <div className="row">
        <div className="col-md-9">
          <div className="quiz-question d-flex align-items-start gap-2">
            <textarea
              className="form-control border-0 bg-transparent fw-bold flex-grow-1"
              style={{ fontSize: "1.05rem", color: "#1a1a1a", minHeight: "72px", resize: "vertical" }}
              placeholder={
                isArabic
                  ? "اكتب نص السؤال هنا (اختياري إذا أضفت صورة أو كود)..."
                  : "Type question text here (optional if you add image or code)..."
              }
              value={questionText}
              onChange={(e) => onQuestionTextChange(e.target.value.replace(/\?+$/, ""))}
              rows={2}
            />
            <div
              className="bg-danger rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm"
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
        </div>
        <div className="col-md-3">
          <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
            <div
              className="bg-danger rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "40px", height: "40px", flexShrink: 0 }}
            >
              <i className="bi bi-star-fill text-white"></i>
            </div>
            <div className="flex-grow-1">
              <label className="form-label fw-bold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                {isArabic ? "درجة السؤال" : "Question Mark"}
              </label>
              <input
                type="number"
                step="0.5"
                className="form-control border-0 bg-white rounded-3 p-2"
                value={marks}
                onChange={(e) => onMarksChange(e.target.value)}
                min="0.5"
                style={{ maxWidth: "120px" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="p-3 bg-light rounded-3 h-100">
            <label className="form-label fw-bold text-dark">
              {isArabic ? "صورة السؤال" : "Question Image"}
            </label>
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

        <div className="col-md-6">
          <div className="p-3 bg-light rounded-3 h-100">
            <label className="form-label fw-bold text-dark">
              {isArabic ? "كود السؤال" : "Question Code"}
            </label>
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
      </div>
    </>
  );
}

export default QuestionEditorFields;
