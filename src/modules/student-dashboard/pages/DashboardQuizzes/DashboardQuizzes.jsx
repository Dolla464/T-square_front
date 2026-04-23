import { useTranslation } from "react-i18next";
import "./DashboardQuizzes.css";

/**
 * صفحة الاختبارات — Placeholder
 * تُملأ بالمحتوى الحقيقي عند توفر الـ API
 */
function DashboardQuizzes() {
  const { t } = useTranslation("studentDashboard");

  return (
    <div className="dash-quizzes">
      <h4 className="dash-page-title">{t("quizzes.title")}</h4>
      <div className="quizzes-placeholder">
        <i className="bi bi-pencil-square quizzes-placeholder-icon"></i>
        <p className="quizzes-placeholder-text">{t("quizzes.placeholder")}</p>
      </div>
    </div>
  );
}

export default DashboardQuizzes;
