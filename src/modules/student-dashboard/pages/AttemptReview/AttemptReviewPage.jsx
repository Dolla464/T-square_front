import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import AttemptAnswerReview from "../../../shared-dashboard/components/AttemptAnswerReview/AttemptAnswerReview";
import ForbiddenAccess from "../../../../components/shared/ForbiddenAccess";
import { useAttemptReview } from "../../../shared-dashboard/hooks/useAttemptReview";
import { formatExamScore } from "../../../shared-dashboard/utils/formatExamScore";
import { buildStudentResultsBackUrl } from "../../../shared-dashboard/utils/studentResultsUrlState";
import "../../../shared-dashboard/components/AttemptAnswerReview/attemptReview.css";
import "../../styles/dashboardShared.css";

function AttemptReviewPage({ role = "student" }) {
  const { attemptId, groupId, studentId, examId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const { data: review, loading, error, forbidden, notFound } = useAttemptReview({
    role,
    attemptId: attemptId ? Number(attemptId) : null,
    groupId: groupId ? Number(groupId) : undefined,
    studentId: studentId ? Number(studentId) : undefined,
    enabled: !!attemptId,
  });

  const handleBack = () => {
    if (role === "student") {
      navigate("/student/quizzes");
      return;
    }
    navigate(
      buildStudentResultsBackUrl(role, { groupId, examId, studentId }),
    );
  };

  return (
    <div className="attempt-review-page" dir={isArabic ? "rtl" : "ltr"}>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="attempt-review-page-header">
        <button type="button" className="topbar-back-btn mb-2" onClick={handleBack}>
          <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`} />
          {role === "student"
            ? t("attempt_review.back_to_quizzes")
            : t("attempt_review.back_to_results")}
        </button>

        <h1 className="attempt-review-page-title">
          {review?.exam_title || t("attempt_review.attempt_review_title")}
        </h1>

        {review ? (
          <p className="attempt-review-page-meta">
            {t("attempt_review.score_summary", {
              score: formatExamScore(review.score ?? 0),
              total: formatExamScore(
                review.attempt_max_marks ?? review.total_marks ?? 0,
              ),
            })}
            {review.finished_at ? ` · ${review.finished_at}` : ""}
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="attempt-review-loading">
          <div className="spinner-border text-danger" role="status" />
          <p className="mt-2 text-muted">{t("attempt_review.review_loading")}</p>
        </div>
      ) : forbidden ? (
        <ForbiddenAccess
          backTo={role === "student" ? "/student/quizzes" : undefined}
          backLabel={
            role === "student" ? t("attempt_review.back_to_quizzes") : undefined
          }
        />
      ) : error ? (
        <div className="attempt-review-error">
          <i className="bi bi-exclamation-triangle-fill fs-2 mb-2 d-block" />
          <p className="mb-0">
            {notFound
              ? t("attempt_review.review_not_found", {
                  defaultValue: "Attempt not found.",
                })
              : t("attempt_review.review_error")}
          </p>
        </div>
      ) : review ? (
        <AttemptAnswerReview review={review} />
      ) : null}

      {role === "student" ? (
        <div className="attempt-review-actions">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleBack}
          >
            {t("attempt_review.back_to_quizzes")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default AttemptReviewPage;
