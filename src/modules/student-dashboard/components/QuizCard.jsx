import i18next from "i18next";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * كومبوننت كارت الكويز - قابل لإعادة الاستخدام بعد التعديل لدعم المحاولات
 * @param {object} quiz - بيانات الكويز القادمة من الـ API Resource المعدل
 * @param {function} t - دالة الترجمة
 */
function QuizCard({ quiz, t }) {
  const navigate = useNavigate();
  const isArabic = i18next.language === "ar";

  // استخراج القيم الجديدة الجاهزة من الـ API Resource
  const {
    is_locked,
    remaining_attempts,
    attempts_count,
    max_attempts,
    is_passed_before,
  } = quiz;

  // تحديد الحالة بناءً على المنطق الجديد للمحاولات
  const isCompletedAndLocked = is_locked; // خلص محاولاته وقفل
  const isAvailable = !is_locked; // لسه متاح يدخل (سواء أول مرة أو إعادة)

  const handleStartQuiz = () => {
    if (isAvailable) {
      navigate(`/student/quizzes/${quiz.id}`);
    }
  };

  return (
    <div className={`quiz-card ${is_locked ? "quiz-card-locked" : ""}`}>
      <div className="quiz-card-icon-wrapper">
        {/* تغيير الأيقونة بناءً على نجاحه السابق */}
        <i
          className={`bi ${is_passed_before ? "bi-check-circle-fill text-success" : is_locked ? "bi-lock-fill" : "bi-pencil-square"} quiz-card-icon`}
        ></i>

        {/* الـ Badge العلوي يتغير بذكاء */}
        <span
          className={`quiz-badge ${is_passed_before ? "badge-success" : is_locked ? "badge-completed" : "badge-new"}`}
          style={
            is_passed_before
              ? { backgroundColor: "#d1fae5", color: "#065f46" }
              : {}
          }
        >
          {is_passed_before
            ? isArabic
              ? "ناجح (متاح للتحسين)"
              : "Passed (Improvement Open)"
            : is_locked
              ? isArabic
                ? "مغلق"
                : "Locked"
              : isArabic
                ? "امتحان مفتوح"
                : "Open"}
        </span>
      </div>

      <div className="quiz-card-body">
        <h6 className="quiz-card-title">{quiz.title}</h6>
        <p className="quiz-card-meta">
          <span>{quiz.course_title}</span>
        </p>

        {/* عداد المحاولات المتبقية */}
        <div
          className="quiz-attempts-counter mb-3"
          style={{ fontSize: "0.82rem", color: "#6c757d" }}
        >
          <i className="bi bi-info-circle me-1"></i>
          {max_attempts ? (
            <span>
              {isArabic
                ? `المحاولات المتبقية: ${remaining_attempts}`
                : `Remaining Attempts: ${remaining_attempts}`}
            </span>
          ) : (
            <span>
              {isArabic ? "المحاولات: غير محدودة" : "Attempts: Unlimited"}
            </span>
          )}
        </div>

        <div className="d-flex gap-2">
          {/* زر المراجعة يظهر دائماً طالما اختبر مسبقاً لرؤية درجته السابقة */}
          {attempts_count > 0 && (
            <Link
              to={`/student/quizzes/${quiz.id}/review`}
              className="btn-continue btn-review text-decoration-none bg-light text-dark border flex-grow-1 text-center py-2 rounded"
            >
              <i className="bi bi-eye me-1"></i>
              {t("active_courses.review")}
            </Link>
          )}

          {/* زر الإجراء: لو لسه متاح (حتى لو ناجح) يكتب له "تحسين الدرجة" */}
          {is_locked ? (
            <button
              disabled
              className="btn-continue bg-secondary-subtle text-muted border-0 cursor-not-allowed w-100"
            >
              {isArabic ? "استنفدت محاولاتك" : "No attempts left"}
            </button>
          ) : (
            <button
              onClick={handleStartQuiz}
              className="btn-continue flex-grow-1"
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i>
              {is_passed_before
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
