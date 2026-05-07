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

  const status = quiz.has_attempt ? "completed" : "pending";

  const isPending = status === "pending";
  const isCompleted = status === "completed";



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
    if (isPending) navigate(`/student/quizzes/${quiz.id}`);
  };

  return (
    <div className="quiz-card" >
      {/* أيقونة الكويز */}
      <div className="quiz-card-icon-wrapper">
        <i className={`bi ${isCompleted ? "bi-check-circle-fill" : "bi-pencil-square"} quiz-card-icon ${isPending ? "quiz-icon-open" : ""}`}></i>
        <span className={`quiz-badge ${isCompleted ? "badge-completed" : isPending ? "badge-progress" : ""}`}>
          {isCompleted
            ? t("active_courses.filter.completed")
            : isPending ? (isArabic ? "امتحان مفتوح" : "Pending") : ""}
        </span>
      </div>

      <div className="quiz-card-body">
        {/* عنوان الكويز */}
        <h6 className="quiz-card-title">{quiz.title}</h6>

        {/* اسم الكورس */}
        <p className="quiz-card-meta">
          <span>{quiz.course_name}</span>
        </p>

        {/* عدد الأسئلة */}
        <div className="d-flex gap-2 mb-1">
          <div className="quiz-score-meta">
            <i className="bi bi-award me-1"></i>
            {quiz.total_marks} {isArabic ? "درجة" : "Marks"}
          </div>
          <div className="quiz-score-meta">
            <i className="bi bi-clock me-1"></i>
            {quiz.duration}
          </div>
        </div>



        {/* زر الإجراء حسب الحالة */}
        {isCompleted ? (
          <Link
            to={`/student/quizzes/${quiz.id}/review`}
            className="btn-continue btn-review text-decoration-none"
          >
            <i className="bi bi-eye me-1"></i>
            {t("active_courses.review")}
          </Link>
        ) : isPending ? (
          <button
            onClick={handleStartQuiz}
            className="btn-continue text-decoration-none"
          >
            <i className="bi bi-play-fill me-1"></i>
            {isArabic ? "ابدأ الكويز" : "Start Quiz"}
          </button>
        ) : ""}

      </div>
    </div>
  );
}

export default QuizCard;