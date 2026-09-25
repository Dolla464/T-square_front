import { useTranslation } from "react-i18next";
import { formatExamScore } from "../../utils/formatExamScore";
import QuestionContent from "../QuestionContent/QuestionContent";
import "../QuestionContent/questionContent.css";

const CHOICE_STATE_LABELS = {
  correct: "correct_answer",
  correct_selected: "correct_answer_selected",
  wrong_selected: "your_answer_wrong",
  neutral: "option",
};

const RESULT_STATUS_LABELS = {
  correct: "question_correct",
  incorrect: "question_incorrect",
  partial_credit: "partial_credit",
  unanswered: "unanswered",
  pending_grading: "pending_grading",
  graded: "question_graded",
};

function formatQuestionDuration(totalSeconds, isArabic = false) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);

  if (seconds < 60) {
    return isArabic ? `${seconds} ث` : `${seconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const parts = [];

  if (hours > 0) {
    parts.push(isArabic ? `${hours} س` : `${hours}h`);
  }
  if (minutes > 0) {
    parts.push(isArabic ? `${minutes} د` : `${minutes}m`);
  }
  if (remainder > 0 || parts.length === 0) {
    parts.push(isArabic ? `${remainder} ث` : `${remainder}s`);
  }

  return parts.join(isArabic ? " " : " ");
}

const RESULT_STATUS_CLASS = {
  correct: "attempt-review-status--correct",
  incorrect: "attempt-review-status--incorrect",
  partial_credit: "attempt-review-status--partial",
  unanswered: "attempt-review-status--unanswered",
  pending_grading: "attempt-review-status--pending",
  graded: "attempt-review-status--correct",
};

function AttemptAnswerReview({
  review,
  compact = false,
  gradingMode = false,
  essayOnly = false,
  gradingValues = {},
  onGradingChange,
  showQuestionTiming = false,
}) {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  if (!review) return null;

  const allQuestions = Array.isArray(review.questions) ? review.questions : [];
  const questions = essayOnly
    ? allQuestions.filter((question) => question.type === "essay")
    : allQuestions;
  const summary = review.summary ?? {};
  const showSummary = !essayOnly;

  return (
    <div
      className={`attempt-review ${compact ? "attempt-review--compact" : ""}`}
      role="region"
      aria-label={t("attempt_review.region_label")}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {showSummary ? (
      <div
        className="attempt-review-summary"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="attempt-review-summary-item attempt-review-summary-item--correct">
          {t("attempt_review.summary_correct", { count: summary.correct ?? 0 })}
        </span>
        <span className="attempt-review-summary-item attempt-review-summary-item--incorrect">
          {t("attempt_review.summary_incorrect", {
            count: summary.incorrect ?? 0,
          })}
        </span>
        <span className="attempt-review-summary-item attempt-review-summary-item--unanswered">
          {t("attempt_review.summary_unanswered", {
            count: summary.unanswered ?? 0,
          })}
        </span>
        {(summary.partial_credit ?? 0) > 0 ? (
          <span className="attempt-review-summary-item attempt-review-status--partial">
            {t("attempt_review.summary_partial_credit", {
              count: summary.partial_credit,
            })}
          </span>
        ) : null}
        {(summary.pending_grading ?? 0) > 0 ? (
          <span className="attempt-review-summary-item attempt-review-status--pending">
            {t("attempt_review.summary_pending_grading", {
              count: summary.pending_grading,
            })}
          </span>
        ) : null}
      </div>
      ) : null}

      {questions.length === 0 ? (
        <p className="text-muted mb-0">
          {isArabic
            ? "لا توجد أسئلة مقالية للتصحيح."
            : "No essay questions to grade."}
        </p>
      ) : null}

      <div className="attempt-review-questions">
        {questions.map((question, index) => {
          const statusClass =
            RESULT_STATUS_CLASS[question.result_status] ?? "";
          const isEssay = question.type === "essay";

          return (
            <article
              key={`${question.id}-${index}`}
              className="attempt-review-question quiz-question"
              aria-labelledby={`question-title-${question.id}-${index}`}
            >
              <div className="attempt-review-question-header">
                <h3
                  id={`question-title-${question.id}-${index}`}
                  className="question-text"
                >
                  {t("attempt_review.question_num", { num: index + 1 })}
                  {isEssay ? (
                    <span className="badge bg-secondary ms-2">
                      {isArabic ? "مقالي" : "Essay"}
                    </span>
                  ) : null}
                </h3>
                <QuestionContent question={question} className="mb-2" />
                <div className="attempt-review-question-meta">
                  <span
                    className={`attempt-review-status ${statusClass}`}
                    id={`question-status-${question.id}-${index}`}
                    aria-describedby={`question-title-${question.id}-${index}`}
                  >
                    {t(
                      `attempt_review.${RESULT_STATUS_LABELS[question.result_status] ?? "option"}`,
                      {
                        defaultValue: question.result_status,
                      },
                    )}
                  </span>
                  {showQuestionTiming ? (
                    <span className="attempt-review-question-timing">
                      {question.time_spent_seconds == null
                        ? t("attempt_review.notRecorded", "Not recorded")
                        : t("attempt_review.timeOnQuestion", {
                            duration: formatQuestionDuration(
                              question.time_spent_seconds,
                              isArabic,
                            ),
                            defaultValue: `Time on question: ${formatQuestionDuration(
                              question.time_spent_seconds,
                              isArabic,
                            )}`,
                          })}
                    </span>
                  ) : null}
                </div>
              </div>

              {isEssay ? (
                <div className="attempt-review-essay">
                  <label className="form-label fw-semibold">
                    {isArabic ? "إجابة الطالب" : "Student Answer"}
                  </label>
                  <div className="p-3 bg-light rounded-3 border">
                    {question.answer_text?.trim() ? (
                      <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                        {question.answer_text}
                      </p>
                    ) : (
                      <p className="text-muted mb-0">
                        {isArabic ? "لم يُجب" : "No answer provided"}
                      </p>
                    )}
                  </div>

                  {gradingMode &&
                  question.result_status === "pending_grading" &&
                  question.answer_id ? (
                    <div className="mt-3">
                      <label className="form-label fw-semibold">
                        {isArabic ? "الدرجة الممنوحة" : "Marks Awarded"}
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          className="form-control"
                          style={{ maxWidth: "140px" }}
                          min="0"
                          max={question.marks}
                          step="0.5"
                          value={gradingValues[question.answer_id] ?? ""}
                          onChange={(e) =>
                            onGradingChange?.(
                              question.answer_id,
                              e.target.value,
                            )
                          }
                        />
                        <span className="text-muted">
                          / {formatExamScore(question.marks ?? 0)}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="quiz-options" role="list">
                  {(question.choices ?? []).map((choice, choiceIndex) => {
                    const letter = String.fromCharCode(65 + choiceIndex);
                    const labelKey =
                      CHOICE_STATE_LABELS[choice.state] ?? "option";

                    return (
                      <div
                        key={choice.id}
                        className={`quiz-option quiz-option--${choice.state}`}
                        role="listitem"
                        aria-label={t(`attempt_review.${labelKey}`, {
                          text: choice.choice_text,
                        })}
                      >
                        <span className="option-letter" aria-hidden="true">
                          {letter}
                        </span>
                        <span className="option-text">{choice.choice_text}</span>
                        {choice.state === "correct" ||
                        choice.state === "correct_selected" ? (
                          <i
                            className="bi bi-check-circle-fill attempt-review-icon attempt-review-icon--correct"
                            aria-hidden="true"
                          />
                        ) : null}
                        {choice.state === "wrong_selected" ? (
                          <i
                            className="bi bi-x-circle-fill attempt-review-icon attempt-review-icon--wrong"
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="attempt-review-marks">
                {t("attempt_review.marks_earned", {
                  earned: formatExamScore(question.marks_earned ?? 0),
                  total: formatExamScore(question.marks ?? 0),
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default AttemptAnswerReview;
