import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toastCustom } from "../../../../components/shared/Toaster/toaster";
import { useExam } from "../../hooks/useExam";
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

  const { exam, loading, error, startExam, saveAnswer, submitExam, submitting } = useExam(quizId);

  useEffect(() => {
    startExam();
  }, [quizId]);

  const questions = exam?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectAnswer = (index) => {
    setSelectedAnswer(index);
  };

  const handleNext = async () => {
    // CRITICAL GUARD: must have a valid attempt before any action
    if (!exam?.attempt_id) {
      toastCustom({
        message: isArabic ? "الاختبار لم يُبدأ بعد، انتظر قليلاً" : "Exam not ready yet, please wait",
        type: "error",
        bsIcon: "bi-x-circle",
        duration: 3000,
      });
      return;
    }

    if (currentQuestion && selectedAnswer !== null) {
      const choiceId = currentQuestion.choices[selectedAnswer].id;
      await saveAnswer(currentQuestion.id, choiceId);
    }

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (isLastQuestion) {
      try {
        // Pass attempt_id to submit — NOT examId
        const result = await submitExam(exam.attempt_id);

        setScoreResult(result.results);
        setShowResult(true);
      } catch (err) {
        toastCustom({
          message: isArabic ? "حدث خطأ أثناء إرسال الإجابات" : "Failed to submit exam",
          type: "error",
          bsIcon: "bi-x-circle",
          duration: 3000,
        });
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleExit = () => {
    navigate("/student/quizzes");
  };

  const handleFinishWithToast = () => {
    const isFailed = scoreResult?.status === "failed";
    toastCustom({
      message: isFailed
        ? isArabic ? "لم تجتز الاختبار، حاول مرة أخرى" : "You did not pass. Better luck next time!"
        : isArabic ? "مبروك! اجتزت الاختبار بنجاح" : "Congratulations! You passed the exam!",
      type: isFailed ? "error" : "success",
      bsIcon: isFailed ? "bi-x-circle" : "bi-check2-circle",
      duration: 4000,
    });
    handleExit();
  };

  if (loading) {
    return (
      <div className="quiz-exam-page">
        <div className="quiz-exam-container d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </div>
    );
  }

  if (error || (!loading && !exam)) {
    return (
      <div className="quiz-exam-page">
        <div className="quiz-exam-container">
          <div className="quiz-exam-placeholder">
            <i className="bi bi-exclamation-circle placeholder-icon"></i>
            <h5>{isArabic ? "الكويز غير موجود أو حدث خطأ" : "Quiz not found or error occurred"}</h5>
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
    const isFailed = scoreResult?.status === "failed";
    const percentage = parseFloat(scoreResult?.percentage) || 0;

    // Semicircle geometry:
    // radius=80, circumference of HALF circle = π * r ≈ 251.2
    const HALF_CIRC = Math.PI * 80; // ≈ 251.33
    const filled = (percentage / 100) * HALF_CIRC;
    const strokeColor = isFailed ? "#ef4444" : "#22c55e";

    return (
      <div className="quiz-result-overlay">
        <div className="quiz-result-content">
          <h4 className="result-title">
            {isArabic ? "نتيجتك" : "Your Result"}
          </h4>

          {/* Animated Half-Circle gauge */}
          <div className="result-circle-wrap" style={{ height: 130, marginBottom: 8 }}>
            <svg
              viewBox="0 0 200 110"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              {/* Background track — open bottom semicircle */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Animated progress arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={strokeColor}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${filled} ${HALF_CIRC}`}
                style={{
                  transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
              {/* Score text inside the arc */}
              <text
                x="100"
                y="82"
                textAnchor="middle"
                fontSize="32"
                fontWeight="800"
                fill="#1a1a1a"
              >
                {scoreResult?.score ?? 0}
              </text>
              <text
                x="100"
                y="100"
                textAnchor="middle"
                fontSize="13"
                fontWeight="500"
                fill="#999"
              >
                / {scoreResult?.total_marks}
              </text>
            </svg>
          </div>

          {/* Percentage label */}
          <p style={{ fontSize: "1.4rem", fontWeight: 700, color: strokeColor, margin: "0 0 6px" }}>
            {scoreResult?.percentage}
          </p>

          {/* Status label */}
          <p className={isFailed ? "result-messageFailed" : "result-messageSucsses"}>
            {isFailed
              ? isArabic ? "رسبت - لم تجتز الحد الأدنى" : "Failed — Below passing mark"
              : isArabic ? "مبروك! تجاوزت الحد الأدنى" : "Passed — Above passing mark"}
          </p>

          <button
            className="btn-continue btn-exit mt-2"
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
          <h5 className="question-text">{currentQuestion?.question_text || currentQuestion?.question}</h5>
        </div>

        <div className="quiz-options">
          {currentQuestion?.choices?.map((choice, idx) => (
            <button
              key={choice.id}
              className={`quiz-option ${selectedAnswer === idx ? "selected" : ""}`}
              onClick={() => handleSelectAnswer(idx)}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="option-text">{choice.choice_text}</span>
            </button>
          ))}
        </div>

        <button
          className="btn-continueQuiz"
          disabled={selectedAnswer === null || submitting || !exam?.attempt_id}
          onClick={handleNext}
        >
          {submitting ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ) : null}
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