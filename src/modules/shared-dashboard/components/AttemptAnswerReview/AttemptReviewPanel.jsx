import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AttemptAnswerReview from "./AttemptAnswerReview";
import { useAttemptReview } from "../../hooks/useAttemptReview";
import "./attemptReview.css";

function AttemptReviewPanel({
  role = "student",
  attemptId,
  groupId,
  studentId,
  quizId,
  examId,
  compact = true,
  enabled = true,
  fullPageTo,
}) {
  const { t } = useTranslation("studentDashboard");

  const { data: review, loading, error } = useAttemptReview({
    role,
    attemptId,
    groupId,
    studentId,
    enabled: enabled && !!attemptId,
  });

  if (!enabled || !attemptId) return null;

  if (loading) {
    return (
      <div className="attempt-review-loading">
        <div className="spinner-border spinner-border-sm text-danger" role="status" />
        <span className="ms-2 text-muted">{t("attempt_review.review_loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attempt-review-error py-3">
        <p className="mb-0">{t("attempt_review.review_error")}</p>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div>
      {fullPageTo ? (
        <div className="attempt-review-actions mb-2">
          <Link to={fullPageTo} className="btn btn-review-action btn-sm">
            <i className="bi bi-box-arrow-up-right me-1" />
            {t("attempt_review.open_full_page")}
          </Link>
        </div>
      ) : null}
      <AttemptAnswerReview review={review} compact={compact} />
    </div>
  );
}

export default AttemptReviewPanel;
