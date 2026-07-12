// مكون كارد مشترك للكورسات والكويزات في الداشبورد
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatInstructorNames, getCourseInstructors } from "../../../utils/courseInstructors";

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
  const { i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");
  const isCourse = type === "course";
  const isQuiz = type === "quiz";

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

  let progress = 0;
  if (isCourse) {
    progress = item.progress;
  } else if (isQuiz) {
    progress =
      item.totalQuestions > 0
        ? Math.round((item.correctAnswers / item.totalQuestions) * 100)
        : 0;
  }

  const getScoreClass = (score) => {
    if (score >= 90) return "score-excellent";
    if (score >= 75) return "score-good";
    return "score-average";
  };

  let linkTo = "#";
  let buttonText = "";
  let buttonClass = "btn-continue";

  if (isCourse) {
    if (isCompleted && !item.enrollment?.has_review) {
      buttonText = isArabic ? "اترك تقييم" : "Leave Review";
      buttonClass += " btn-review";
      linkTo = `/student/review/${item.id}`;
    } else if (isCompleted) {
      buttonText = t("active_courses.review");
      buttonClass += " btn-review";
      linkTo = `/student/course/${item.id}`;
    } else {
      buttonText = t("course.continue");
      linkTo = `/student/course/${item.id}`;
    }
  }

  const handleClick = () => {
    navigate(linkTo);
  };

  const handleCertificateClick = () => {
    navigate("/student/certificates");
  };

  const certificateAvailable = item.enrollment?.certificate_available === true;

  return (
    <div className={`${isCourse ? "course-card" : "quiz-card"}`}>
      {isCourse ? (
        <div className="course-card-img-wrapper">
          <img
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

      <div
        className={`${isCourse ? "course-card-body" : "quiz-card-body"}`}
        dir="ltr"
      >
        <h6 className={`${isCourse ? "course-card-title" : "quiz-card-title"}`}>
          {item.title}
        </h6>

        {isCourse ? (
          <p className="course-card-meta mb-2">
            <span>{formatInstructorNames(getCourseInstructors(item))}</span>
          </p>
        ) : (
          <p className="quiz-card-meta">
            <span>{item.courseName}</span>
          </p>
        )}

        {isQuiz && (
          <p className="quiz-card-meta" style={{ fontSize: "0.72rem" }}>
            <i className="bi bi-alarm me-1"></i>
            {item.duration} mins
          </p>
        )}

        {isQuiz && (
          <div className="quiz-score-meta">
            <i className="bi bi-question-circle me-1"></i>
            {item.total_marks} marks
          </div>
        )}

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

        <div className="d-flex gap-1">
          <button onClick={handleClick} className={buttonClass + " " + (isCompleted ? " " : "")}>
            <i
              className={`${isCourse && !isCompleted ? "bi bi-play-fill " : "bi bi-eye "} me-1`}
            ></i>
            {buttonText}
          </button>
          {isCourse && certificateAvailable && (
            <button
              onClick={handleCertificateClick}
              className={buttonClass}
              style={{ width: "fit-content" }}
              title={isArabic ? "عرض الشهادة" : "View Certificate"}
            >
              <i className="bi bi-file-earmark-pdf me-1"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;
