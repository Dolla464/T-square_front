import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QUIZ_EXAMS } from "../../data/dashboardMockData";
import { toastCustom } from "../../../../components/shared/Toaster/toaster";
import "../../styles/dashboardShared.css";

/**
 * صفحة اختبار الكويز - QuizExamPage
 * تعرض أسئلة الكويز وتحسب النتيجة
 */
function QuizExamPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language === "ar";

  const quiz = QUIZ_EXAMS[parseInt(quizId)];
  const questions = quiz?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectAnswer = (index) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const calculateScore = useMemo(() => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });
    return { correct, total: totalQuestions };
  }, [answers, questions, totalQuestions]);

  const handleExit = () => {
    navigate("/student/quizzes");
  };

  const handleFinishWithToast = () => {
    // حساب النتيجة
    const { correct, total } = calculateScore;
    const percentage = Math.round((correct / total) * 100);

    // عرض التوست بناءً على النتيجة
    if (percentage >= 60) {
      toastCustom({
        message: isArabic
          ? "تم إنهاء الاختبار بنجاح!"
          : "Quiz completed successfully!",
        type: "success",
        bsIcon: "bi-check2-circle",
        duration: 3000,
      });
    } else {
      toastCustom({
        message: isArabic
          ? "حاول مرة أخرى لتحسين نتيجتك"
          : "Try again to improve your score",
        type: "warning",
        bsIcon: "bi-exclamation-triangle",
        duration: 3000,
      });
    }

    handleExit();
  };

  if (!quiz) {
    return (
      <div className="quiz-exam-page">
        <div className="quiz-exam-container">
          <div className="quiz-exam-placeholder">
            <i className="bi bi-exclamation-circle placeholder-icon"></i>
            <h5>{isArabic ? "الكويز غير موجود" : "Quiz not found"}</h5>
            <button className="btn-continue" onClick={handleExit}>
              <i className="bi bi-arrow-left me-1"></i>
              {isArabic ? "العودة" : "Back"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const { correct, total } = calculateScore;
    const percentage = Math.round((correct / total) * 100);

    return (
      <div className="quiz-result-overlay">
        <div className="quiz-result-content">
          {/* عنوان النتيجة */}
          <h4 className="result-title">
            {isArabic ? "نتيجتك" : "Your Result"}
          </h4>

          {/* دائرة.progress الدائرية مع نسبة مئوية */}
          <div className="result-circle-wrap">
            <svg
              className="result-circle-svg"
              viewBox="0 0 100 100"
            >
              {/* خلفية الدائرة */}
              <circle
                className="result-circle-bg"
                cx="50"
                cy="50"
                r="45"
              />
              {/* الدائرة التي تملئ */}
              <circle
                className="result-circle-progress"
                cx="50"
                cy="50"
                r="45"
                strokeDasharray={`${percentage * 2.83} 283`}
              />
            </svg>
            <div className="result-circle-text">
              <span className="result-score">{correct}</span>
              <span className="result-divider">/</span>
              <span className="result-total">{total}</span>
            </div>
          </div>

          {/* رسالة النتيجة */}
          <p className="result-message">
            {percentage >= 70
              ? isArabic
                ? "عمل رائع!"
                : "Excellent!"
              : percentage >= 60
                ? isArabic
                  ? "جيد!"
                  : "Good job!"
                : isArabic
                  ? "حاول مرة أخرى"
                  : "Keep practicing!"}
          </p>

          {/* زر الخروج */}
          <button
            className="btn-continue btn-exit"
            onClick={handleFinishWithToast}
          >
            <i className="bi bi-arrow-left me-2"></i>
            {isArabic ? "خروج" : "Exit"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-exam-page">
      <div className="quiz-exam-container">
        <button className="topbar-back-btn mb-3" onClick={handleExit}>
          <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}></i>
          {isArabic ? "خروج" : "Exit"}
        </button>

        <div className="quiz-progress">
          <span>
            {isArabic ? "سؤال" : "Question"} {currentIndex + 1} {isArabic ? "من" : "of"}{" "}
            {totalQuestions}
          </span>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="quiz-question">
          <h5 className="question-text">{currentQuestion?.question}</h5>
        </div>

        <div className="quiz-options">
          {currentQuestion?.options.map((option, idx) => (
            <button
              key={idx}
              className={`quiz-option ${selectedAnswer === idx ? "selected" : ""}`}
              onClick={() => handleSelectAnswer(idx)}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        <button
          className="btn-continueQuiz"
          disabled={selectedAnswer === null}
          onClick={handleNext}
        >
          {isLastQuestion
            ? isArabic
              ? "إنهاء"
              : "Finish"
            : isArabic
              ? "التالي"
              : "Next"}
          <i className={`bi ${isLastQuestion ? "bi-check2-all" : "bi-arrow-right"} ms-2`}></i>
        </button>
      </div>
    </div>
  );
}

export default QuizExamPage;