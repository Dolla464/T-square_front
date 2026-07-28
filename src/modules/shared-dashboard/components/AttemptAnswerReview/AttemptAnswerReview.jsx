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
  unanswered: "unanswered",
};

const RESULT_STATUS_CLASS = {
  correct: "attempt-review-status--correct",
  incorrect: "attempt-review-status--incorrect",
  unanswered: "attempt-review-status--unanswered",
};

function AttemptAnswerReview({ review, compact = false }) {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  if (!review) return null;

  const questions = Array.isArray(review.questions) ? review.questions : [];
  const summary = review.summary ?? {};

  return (
    <div
      className={`attempt-review ${compact ? "attempt-review--compact" : ""}`}
      role="region"
      aria-label={t("attempt_review.region_label")}
      dir={isArabic ? "rtl" : "ltr"}
    >
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
      </div>

      <div className="attempt-review-questions">
        {questions.map((question, index) => {
          const statusClass =
            RESULT_STATUS_CLASS[question.result_status] ?? "";

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
                </h3>
                <QuestionContent question={question} className="mb-2" />
                <span
                  className={`attempt-review-status ${statusClass}`}
                  id={`question-status-${question.id}-${index}`}
                  aria-describedby={`question-title-${question.id}-${index}`}
                >
                  {t(
                    `attempt_review.${RESULT_STATUS_LABELS[question.result_status]}`,
                  )}
                </span>
              </div>

              <div className="quiz-options" role="list">
                {(question.choices ?? []).map((choice, choiceIndex) => {
                  const letter = String.fromCharCode(65 + choiceIndex);
                  const labelKey = CHOICE_STATE_LABELS[choice.state] ?? "option";

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
