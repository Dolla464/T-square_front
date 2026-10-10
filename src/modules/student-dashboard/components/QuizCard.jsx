import i18next from "i18next";

import { useNavigate } from "react-router-dom";
import { clearQuizAttemptCompleted } from "../utils/quizExamSession";
import { isArabicLocale } from "../../../utils/isArabicLocale";

function QuizCard({ quiz, t }) {
  const navigate = useNavigate();
  const isArabic = isArabicLocale(i18next.language);

  const {
    is_locked,
    has_ongoing_attempt,
    remaining_attempts,
    has_attempt,
    max_attempts,
    duration,
    is_passed_before,
  } = quiz;

  const handleStartQuiz = () => {
    if (has_ongoing_attempt || !is_locked) {
      clearQuizAttemptCompleted(quiz.id);
      navigate(`/student/quizzes/${quiz.id}`);
    }
  };

  return (
    <div className={`quiz-card ${is_locked && !has_ongoing_attempt ? "quiz-card-locked" : ""}`}>
      <div className="quiz-card-icon-wrapper">
        <i
          className={`bi ${
            has_ongoing_attempt
              ? "bi-play-circle-fill text-primary"
              : is_locked
                ? "bi-lock-fill"
                : "bi-pencil-square"
          } quiz-card-icon`}
        />

        <span
          className="quiz-badge"
          style={
            has_ongoing_attempt
              ? { backgroundColor: "#dbeafe", color: "#1e40af" }
              : is_locked
                ? { backgroundColor: "#ffcccc", color: "#990000" }
                : { backgroundColor: "#c5e9ff", color: "#0d47a1" }
          }
        >
          {has_ongoing_attempt
            ? isArabic
              ? "جاري"
              : "In Progress"
            : is_locked
              ? isArabic
                ? "مغلق"
                : "Locked"
              : isArabic
                ? "مفتوح"
                : "Open"}
        </span>
      </div>

      <div className="quiz-card-body">
        <h6 className="quiz-card-title">{quiz.title}</h6>
        <p className="quiz-card-meta">{quiz.description}</p>
        <p className="quiz-card-meta">{quiz.course_title}</p>

        <div
          className="quiz-attempts-counter mb-1"
          style={{ fontSize: "0.82rem", color: "#6c757d" }}
        >
          <i className="bi bi-info-circle me-1" />
          <span>
            {max_attempts
              ? isArabic
                ? `المحاولات المتبقية: ${remaining_attempts}`
                : `Remaining Attempts: ${remaining_attempts}`
              : isArabic
                ? "المحاولات: غير محدودة"
                : "Attempts: Unlimited"}
          </span>
        </div>

        <div
          className="quiz-attempts-counter mb-1"
          style={{ fontSize: "0.82rem", color: "#6c757d" }}
        >
          <i className="bi bi-clock-history me-1" />
          <span>
            {duration
              ? isArabic
                ? `الوقت المخصص: ${duration}`
                : `Time: ${duration}`
              : isArabic
                ? "الوقت: غير محدد"
                : "Time: N/A"}
          </span>
        </div>

        <div className="d-flex gap-2">
          {has_ongoing_attempt ? (
            <button type="button" onClick={handleStartQuiz} className="btn-continue flex-grow-1">
              <i className="bi bi-play-circle me-1" />
              {isArabic ? "متابعة الاختبار" : "Resume Quiz"}
            </button>
          ) : is_locked ? (
            <button
              type="button"
              disabled
              className="btn-continue bg-secondary-subtle text-muted border-0 w-100"
            >
              {isArabic ? "استنفدت محاولاتك" : "No attempts left"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartQuiz}
              className={`btn-continue flex-grow-1${
                has_attempt && is_passed_before ? " btn-continue-improve" : ""
              }`}
            >
              <i
                className={`${
                  !has_attempt
                    ? "bi bi-play-circle"
                    : is_passed_before
                      ? "bi bi-graph-up-arrow"
                      : "bi bi-arrow-counterclockwise"
                } me-1`}
              />
              {!has_attempt
                ? isArabic
                  ? "بدء الاختبار"
                  : "Start Quiz"
                : is_passed_before
                  ? isArabic
                    ? "تحسين الدرجة"
                    : "Improve Score"
                  : isArabic
                    ? "إعادة المحاولة"
                    : "Retry"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizCard;
