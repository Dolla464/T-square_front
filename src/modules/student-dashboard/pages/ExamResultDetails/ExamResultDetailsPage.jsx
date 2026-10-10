import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import QuizResultsContent from "../../components/QuizResultsContent";
import { useQuizzes } from "../../hooks/useQuizzes";
import { useExamResults } from "../../hooks/useExamResults";
import { hasExamAttempts } from "../../utils/filterExamResults";
import "../../styles/dashboardShared.css";
import "./ExamResultDetailsPage.css";
import { isArabicLocale } from "../../../../utils/isArabicLocale";

function ExamResultDetailsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = isArabicLocale(i18n.language);

  const numericQuizId = quizId ? Number(quizId) : null;
  const { quizzes, loading: quizzesLoading } = useQuizzes();
  const { results, loading, error, fetchResults } = useExamResults(numericQuizId);

  const quiz = useMemo(
    () => (quizzes || []).find((item) => Number(item.id) === numericQuizId) ?? null,
    [quizzes, numericQuizId],
  );

  useEffect(() => {
    if (numericQuizId) {
      fetchResults();
    }
  }, [numericQuizId, fetchResults]);

  const handleBack = () => {
    navigate("/student/exam-results");
  };

  const hasAttempts = quiz ? hasExamAttempts(quiz) : false;

  return (
    <div className="exam-result-details-page" dir={isArabic ? "rtl" : "ltr"}>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="exam-result-details-header">
        <button type="button" className="topbar-back-btn mb-2" onClick={handleBack}>
          <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`} />
          {t("exam_results.back_to_list")}
        </button>
      </div>

      {quizzesLoading ? (
        <div className="dash-loading">
          <div className="spinner-border text-danger" role="status" />
        </div>
      ) : !quiz || !hasAttempts ? (
        <div className="exam-result-details-empty">
          <i className="bi bi-bar-chart-line exam-results-empty-icon" />
          <p className="mb-3">{t("exam_results.not_found")}</p>
          <button type="button" className="btn btn-danger" onClick={handleBack}>
            {t("exam_results.back_to_list")}
          </button>
        </div>
      ) : (
        <div className="exam-result-details-content">
          <div className="exam-result-details-intro">
            <h1 className="exam-result-details-title">
              {quiz.title || t("exam_results.detail_title")}
            </h1>
            {quiz.course_title ? (
              <p className="exam-result-details-meta">{quiz.course_title}</p>
            ) : null}
          </div>

          <QuizResultsContent
            quiz={quiz}
            results={results}
            loading={loading}
            error={error}
            t={t}
            isArabic={isArabic}
          />
        </div>
      )}
    </div>
  );
}

export default ExamResultDetailsPage;
