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
        setScoreResult(result);
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
    toastCustom({
      message: isArabic
        ? "تم إنهاء الاختبار بنجاح!"
        : "Quiz completed successfully!",
      type: "success",
      bsIcon: "bi-check2-circle",
      duration: 3000,
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
    return (
      <div className="quiz-result-overlay">
        <div className="quiz-result-content">
          <h4 className="result-title">
            {isArabic ? "نتيجتك" : "Your Result"}
          </h4>

          <div className="result-circle-wrap">
             <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "5rem" }}></i>
          </div>

          <p className="result-message mt-3">
             {isArabic ? "تم إرسال إجاباتك بنجاح!" : "Your answers have been submitted successfully!"}
          </p>

          <button
            className="btn-continue btn-exit mt-4"
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