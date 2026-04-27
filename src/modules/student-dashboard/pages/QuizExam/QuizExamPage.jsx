import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

/**
 * صفحة اختبار الكويز - QuizExamPage
 * صفحة مؤقتة لاختبار الكويز - تعرض الـ quizId للاختبار
 */
function QuizExamPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language === "ar";

  return (
    <div className="quiz-exam-page">
      <div className="quiz-exam-container">
        {/* زر الرجوع */}
        <button
          className="topbar-back-btn mb-3"
          onClick={() => navigate("/student/quizzes")}
        >
          <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}></i>
          {isArabic ? "العودة للاختبارات" : "Back to Quizzes"}
        </button>

        {/* عنوان الصفحة */}
        <h4 className="dash-page-title mb-4">
          {isArabic ? "اختبار الكويز" : "Quiz Exam"}
        </h4>

        {/* معلومات الكويز */}
        <div className="quiz-exam-info">
          <div className="info-card">
            <i className="bi bi-pencil-square info-icon"></i>
            <div className="info-content">
              <span className="info-label">
                {isArabic ? "رقم الكويز" : "Quiz ID"}
              </span>
              <span className="info-value">#{quizId}</span>
            </div>
          </div>

          <div className="info-card">
            <i className="bi bi-journal-text info-icon"></i>
            <div className="info-content">
              <span className="info-label">
                {isArabic ? "عدد الأسئلة" : "Questions"}
              </span>
              <span className="info-value">--</span>
            </div>
          </div>

          <div className="info-card">
            <i className="bi bi-clock info-icon"></i>
            <div className="info-content">
              <span className="info-label">
                {isArabic ? "الوقت" : "Time Limit"}
              </span>
              <span className="info-value">--</span>
            </div>
          </div>
        </div>

        {/* رسالة توضيحية */}
        <div className="quiz-exam-placeholder">
          <i className="bi bi-ui-checks-grid placeholder-icon"></i>
          <h5>
            {isArabic
              ? "جاري العمل على صفحة الكويز..."
              : "Quiz page Coming Soon..."}
          </h5>
          <p>
            {isArabic
              ? `هذه الصفحة لاختبار الكويز رقم ${quizId}`
              : `This is the quiz exam page for Quiz #${quizId}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default QuizExamPage;