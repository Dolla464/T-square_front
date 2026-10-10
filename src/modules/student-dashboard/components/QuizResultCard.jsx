import i18next from "i18next";
import { useNavigate } from "react-router-dom";
import {
  isExamFailedFromList,
  isExamPassedFromList,
} from "../utils/filterExamResults";

function getListStatusBadge(quiz, t) {
  if (isExamPassedFromList(quiz)) {
    return {
      label: t("exam_results.status.passed"),
      style: { backgroundColor: "#d1fae5", color: "#065f46" },
      icon: "bi-check-circle-fill",
    };
  }

  if (isExamFailedFromList(quiz)) {
    return {
      label: t("exam_results.status.failed"),
      style: { backgroundColor: "#fee2e2", color: "#991b1b" },
      icon: "bi-x-circle-fill",
    };
  }

  if (quiz?.has_ongoing_attempt) {
    return {
      label: t("exam_results.status.in_progress"),
      style: { backgroundColor: "#dbeafe", color: "#1e40af" },
      icon: "bi-play-circle-fill",
    };
  }

  return {
    label: t("exam_results.status.attempted"),
    style: { backgroundColor: "#f3f4f6", color: "#374151" },
    icon: "bi-bar-chart-line",
  };
}

function QuizResultCard({ quiz, t }) {
  const navigate = useNavigate();
  const status = getListStatusBadge(quiz, t);

  const handleShowDetails = () => {
    navigate(`/student/exam-results/${quiz.id}`);
  };

  return (
    <article className="quiz-card quiz-result-card">
      <div className="quiz-card-icon-wrapper quiz-result-card-icon-wrapper">
        <i className={`bi ${status.icon} quiz-card-icon`} />
        <span className="quiz-badge" style={status.style}>
          {status.label}
        </span>
      </div>

      <div className="quiz-card-body">
        <h6 className="quiz-card-title">{quiz.title}</h6>
        {quiz.course_title ? (
          <p className="quiz-card-meta">{quiz.course_title}</p>
        ) : null}

        <div
          className="quiz-attempts-counter mb-1"
          style={{ fontSize: "0.82rem", color: "#6c757d" }}
        >
          <i className="bi bi-list-check me-1" />
          <span>{t("exam_results.attempts_count", { count: quiz.attempts_count ?? 0 })}</span>
        </div>

        <button type="button" onClick={handleShowDetails} className="btn-continue flex-grow-1">
          <i className="bi bi-bar-chart-line me-1" />
          {t("exam_results.show_details")}
        </button>
      </div>
    </article>
  );
}

export default QuizResultCard;
