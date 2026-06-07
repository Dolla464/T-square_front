// مكون كارد مشترك للكورسات والكويزات في الداشبورد
import React from "react";
import { useNavigate } from "react-router-dom";

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
  const isCompleted = isQuiz
    ? item.has_attempt === true
    : isCourse
      ? item.enrollment?.status === "completed"
      : false;

  const isPending = isQuiz
    ? !item.has_attempt
    : isCourse
      ? item.enrollment?.status === "in_progress"
      : false;
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
      buttonText = t("active_courses.review");
      buttonClass += " btn-review";
    } else {
      // الكورس قيد التنفيذ — الذهاب لصفحة تفاصيل الكورس
      buttonText = t("course.continue");
    }
  }

  // معالج حدث الضغط — ينتقل للرابط مع تمرير بيانات الكورس
  const handleClick = () => {
    navigate(`/student/course/${item.id}`);
  };
  const handleCertificateClick = () => {
    navigate("/student/certificates");
  };

  return (
    <div className={`${isCourse ? "course-card" : "quiz-card"}`}>
      {/* الصورة أو الأيقونة */}
      {isCourse ? (
        <div className="course-card-img-wrapper">
          <img
            // item.thumbnail from api
            src={item.cover_image || "/default-course-cover.jpg"}
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
          <i
            className={`bi bi-pencil-square quiz-card-icon ${isCompleted ? "quiz-icon-complet" : "quiz-icon-open"}`}
          ></i>
          <span
            className={`quiz-badge ${isCompleted ? "badge-completed" : "badge-progress "}`}
          >
            {isCompleted
              ? t("active_courses.filter.completed")
              : isPending
                ? t("active_courses.filter.Pending")
                : t("active_courses.filter.open")}
          </span>
        </div>
      )}

      {/* جسم الكارد */}
      <div
        className={`${isCourse ? "course-card-body" : "quiz-card-body"}`}
        dir="ltr"
      >
        {/* العنوان */}
        <h6 className={`${isCourse ? "course-card-title" : "quiz-card-title"}`}>
          {item.title}
        </h6>

        {/* معلومات الميتا */}
        {isCourse ? (
          <p className="course-card-meta mb-2">
            <span>{item.instructor.full_name}</span>
          </p>
        ) : (
          <p className="quiz-card-meta">
            <span>{item.courseName}</span>
          </p>
        )}

        {/* معلومات إضافية للكويز (تاريخ الإنشاء) */}
        {isQuiz && (
          <p className="quiz-card-meta" style={{ fontSize: "0.72rem" }}>
            <i className="bi bi-alarm me-1"></i>
            {item.duration} mins
          </p>
        )}

        {/* معلومات الكويز/النتيجة */}
        {isQuiz && (
          <div className="quiz-score-meta">
            <i className="bi bi-question-circle me-1"></i>
            {item.total_marks} marks
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
        <div className="d-flex gap-1">
          <button onClick={handleClick} className={buttonClass + " " + (isCompleted ? " " : "")}>
            <i
              className={`${isCourse && !isCompleted ? "bi bi-play-fill " : "bi bi-eye "} me-1`}
            ></i>
            {buttonText}
          </button>
          {item.enrollment?.status === "completed" && (
            <button onClick={handleCertificateClick} className={buttonClass} style={{ width: "fit-content" }}>
              <i
                className="bi bi-file-earmark-pdf me-1"
              ></i>
            </button>
          )}
        </div>


      </div>
    </div>
  );
}

export default DashboardCard;
