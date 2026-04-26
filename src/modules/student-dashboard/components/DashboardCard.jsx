// مكون كارد مشترك للكورسات والكويزات في الداشبورد
import React from "react";
import { useNavigate } from "react-router-dom";
import courseImg from "../../../assets/about1.png";

/**
 * مكون كارد مشترك للكورسات والكويزات في الداشبورد
 * يعرض تفاصيل الكورس أو الكويز بشكل ديناميكي بناءً على `type`
 *
 * @param {object} item - بيانات الكورس أو الكويز
 * @param {string} type - نوع الكارد ("course" أو "quiz")
 * @param {function} t - دالة الترجمة
 */
function DashboardCard({ item, type, t }) {
  const navigate = useNavigate();
  const isCourse = type === "course";
  const isQuiz = type === "quiz";

  // تحديد حالة الاكتمال
  const isCompleted = item.status === "completed";

  // حساب التقدم للكورسات أو الكويزات
  let progress = 0;
  if (isCourse) {
    progress = item.progress;
  } else if (isQuiz) {
    progress =
      item.totalQuestions > 0
        ? Math.round((item.correctAnswers / item.totalQuestions) * 100)
        : 0;
  }

  // تحديد لون النتيجة للكويزات
  const getScoreClass = (score) => {
    if (score >= 90) return "score-excellent";
    if (score >= 75) return "score-good";
    return "score-average";
  };

  // تحديد مسار الرابط ونص الزر
  let linkTo = "#";
  let buttonText = "";
  let buttonClass = "btn-continue";

  if (isCourse) {
    if (isCompleted) {
      // الكورس مكتمل — الذهاب للشهادات
      linkTo = "/student/certificates";
      buttonText = t("active_courses.review");
      buttonClass += " btn-review";
    } else {
      // الكورس قيد التنفيذ — الذهاب لصفحة تفاصيل الكورس
      linkTo = `/student/course/${item.id}`;
      buttonText = t("course.continue");
    }
  } else if (isQuiz) {
    if (isCompleted) {
      linkTo = `/student/quizzes/${item.id}/review`;
      buttonText = t("active_courses.review");
      buttonClass += " btn-review";
    } else {
      linkTo = `/student/quizzes/${item.id}`;
      buttonText = t("active_courses.continue");
    }
  }

  // معالج حدث الضغط — ينتقل للرابط مع تمرير بيانات الكورس
  const handleClick = () => {
    navigate(linkTo, { state: { course: item } });
  };

  return (
    <div className={`${isCourse ? "course-card" : "quiz-card"}`}>
      {/* الصورة أو الأيقونة */}
      {isCourse ? (
        <div className="course-card-img-wrapper">
          <img
            src={item.image || courseImg}
            alt={item.title}
            className="course-card-img"
          />
          <span
            className={`course-badge ${isCompleted ? "badge-completed" : "badge-progress"}`}
          >
            {isCompleted
              ? t("active_courses.filter.completed")
              : t("active_courses.filter.in_progress")}
          </span>
        </div>
      ) : (
        <div className="quiz-card-icon-wrapper">
          <i className="bi bi-pencil-square quiz-card-icon"></i>
          <span
            className={`quiz-badge ${isCompleted ? "badge-completed" : "badge-progress"}`}
          >
            {isCompleted
              ? t("active_courses.filter.completed")
              : t("active_courses.filter.in_progress")}
          </span>
        </div>
      )}

      {/* جسم الكارد */}
      <div className={`${isCourse ? "course-card-body" : "quiz-card-body"}`}>
        {/* العنوان */}
        <h6 className={`${isCourse ? "course-card-title" : "quiz-card-title"}`}>
          {item.title}
        </h6>

        {/* معلومات الميتا */}
        {isCourse ? (
          <p className="course-card-meta">
            <span>{item.instructor}</span>
            <span className="meta-dot"> · </span>
            <span>{item.category}</span>
          </p>
        ) : (
          <p className="quiz-card-meta">
            <span>{item.courseName}</span>
          </p>
        )}

        {/* معلومات إضافية للكويز (تاريخ الإنشاء) */}
        {isQuiz && (
          <p className="quiz-card-meta" style={{ fontSize: "0.72rem" }}>
            <i className="bi bi-calendar3 me-1"></i>
            {item.createdAt}
          </p>
        )}

        {/* معلومات الكويز/النتيجة */}
        {isCourse ? (
          <div className="course-quiz-meta">
            <i className="bi bi-pencil-square me-1"></i>
            {item.quizzesCompleted}/{item.totalQuizzes} quizzes
          </div>
        ) : (
          <div className="quiz-score-meta">
            <i className="bi bi-question-circle me-1"></i>
            {item.correctAnswers}/{item.totalQuestions} questions
          </div>
        )}

        {/* عرض النتيجة للكويزات المكتملة */}
        {isQuiz && isCompleted && item.score !== null && (
          <div className="quiz-score-display">
            <span className={`score-badge ${getScoreClass(item.score)}`}>
              {item.score}%
            </span>
            <span style={{ fontSize: "0.72rem", color: "#888" }}>
              {item.score >= 90
                ? "Excellent"
                : item.score >= 75
                  ? "Good"
                  : "Average"}
            </span>
          </div>
        )}

        {/* زر الإجراء — الانتقال للكورس أو الكويز */}
        <button onClick={handleClick} className={buttonClass}>
          <i
            className={`${isCourse && !isCompleted ? "bi bi-play-fill" : "bi bi-eye"} me-1`}
          ></i>
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default DashboardCard;
