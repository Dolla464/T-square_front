import i18next from "i18next";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * كومبوننت كارت الكويز - قابل لإعادة الاستخدام
 * @param {object} quiz - بيانات الكويز
 * @param {function} t - دالة الترجمة
 *
 * حالات الكويز:
 * - pending: لم يفتح بعد - يظهر بستايل معطل
 * - open: متاح للبدء - يمكن للطالب يبدأه
 * - completed: مكتمل - يمكن viewing results
 */
function QuizCard({ quiz, t }) {
  const navigate = useNavigate();
  const isArabic = i18next.language === "ar";

  const status = quiz.status || "pending";

  const isPending = status === "pending";
  const isOpen = status === "open";
  const isCompleted = status === "completed";

  const progress =
    quiz.totalQuestions > 0
      ? Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)
      : 0;

  const getScoreClass = (score) => {
    if (score >= 90) return "score-excellent";
    if (score >= 75) return "score-good";
    return "score-average";
  };

  function getQuizLevel(score) {
    if (isArabic) {
      if (score >= 90) return "ممتاز";
      if (score >= 75) return "جيد";
      return "متوسط";
    } else {
      if (score >= 90) return "Excellent";
      if (score >= 75) return "Good";
      return "Average";
    }
  }

  const handleStartQuiz = () => {
    if (isOpen) {
      navigate(`/student/quizzes/${quiz.id}`);
    }
  };

  return (
    <div className={`quiz-card ${isPending ? "quiz-card-disabled" : ""}`}>
      {/* أيقونة الكويز */}
      <div className="quiz-card-icon-wrapper">
        <i className={`bi ${isCompleted ? "bi-check-circle-fill" : "bi-pencil-square"} quiz-card-icon ${isOpen ? "quiz-icon-open" : ""}`}></i>
        <span className={`quiz-badge ${isCompleted ? "badge-completed" : isOpen ? "badge-open" : "badge-pending"}`}>
          {isCompleted
            ? t("active_courses.filter.completed")
            : isOpen
              ? isArabic ? "مفتوح" : "Open"
              : isArabic ? "لم يفتح بعد" : "Pending"}
        </span>
      </div>

      <div className="quiz-card-body">
        {/* عنوان الكويز */}
        <h6 className="quiz-card-title">{quiz.title}</h6>

        {/* اسم الكورس */}
        <p className="quiz-card-meta">
          <span>{quiz.courseName}</span>
        </p>

        {/* معلومات إضافية */}
        <p className="quiz-card-meta" style={{ fontSize: "0.72rem" }}>
          <i className="bi bi-calendar3 me-1"></i>
          {quiz.createdAt}
        </p>

        {/* عدد الأسئلة */}
        <div className="quiz-score-meta">
          <i className="bi bi-question-circle me-1"></i>
          {quiz.totalQuestions} questions
        </div>

        {/* النتيجة (لو مكتمل) */}
        {isCompleted && quiz.score !== null && (
          <div className="quiz-score-display">
            <span className={`score-badge ${getScoreClass(quiz.score)}`}>
              {quiz.score}%
            </span>
            <span style={{ fontSize: "0.72rem", color: "#888" }}>
              {getQuizLevel(quiz.score)}
            </span>
          </div>
        )}

        {/* زر الإجراء حسب الحالة */}
        {isCompleted ? (
          <Link
            to={`/student/quizzes/${quiz.id}/review`}
            className="btn-continue btn-review text-decoration-none"
          >
            <i className="bi bi-eye me-1"></i>
            {t("active_courses.review")}
          </Link>
        ) : isOpen ? (
          <button
            onClick={handleStartQuiz}
            className="btn-continue text-decoration-none"
          >
            <i className="bi bi-play-fill me-1"></i>
            {isArabic ? "ابدأ الكويز" : "Start Quiz"}
          </button>
        ) : (
          <button
           disabled
            className="btn-continue btn-disabled text-decoration-none"
          >
            <i className="bi bi-lock me-1"></i>
            {isArabic ? "لم يفتح بعد" : "Not Available"}
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizCard;