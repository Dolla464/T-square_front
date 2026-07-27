import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toastCustom } from "../../../../components/shared/Toaster/toaster";
import { useExam } from "../../hooks/useExam";
import AttemptReviewPanel from "../../../shared-dashboard/components/AttemptAnswerReview/AttemptReviewPanel";
import { invalidateAttemptReview } from "../../../shared-dashboard/hooks/attemptReviewCache";
import { formatExamScore } from "../../../shared-dashboard/utils/formatExamScore";
import "../../../shared-dashboard/components/AttemptAnswerReview/attemptReview.css";
import "../../styles/dashboardShared.css";

const QuizTimer = React.memo(({ durationMins, attemptId, quizId, isArabic, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!durationMins || durationMins <= 0 || !attemptId) return;

    const storageKey = `quiz_timer_${quizId}_${attemptId}`;
    const savedEndTime = localStorage.getItem(storageKey);
    let endTime;

    if (savedEndTime) {
      endTime = parseInt(savedEndTime, 10);
    } else {
      endTime = Date.now() + durationMins * 60 * 1000;
      localStorage.setItem(storageKey, endTime.toString());
    }

    const calculateTimeLeft = () => {
      const difference = endTime - Date.now();
      if (difference <= 0) {
        return 0;
      }
      return Math.floor(difference / 1000);
    };

    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    if (initialTime <= 0) {
      onTimeout();
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        localStorage.removeItem(storageKey);
        onTimeout();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [durationMins, attemptId, quizId, onTimeout]);

  if (timeLeft === null) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`quiz-timer-badge ${timeLeft < 60 ? "timer-warning" : ""}`}>
      <i className="bi bi-clock me-1"></i>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
});

/**
 * صفحة اختبار الكويز - QuizExamPage
 * تعرض أسئلة الكويز وتحسب النتيجة
 */
function QuizExamPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const hasStarted = useRef(false);
  const { i18n, t } = useTranslation("studentDashboard");
  const isArabic = i18n.language === "ar";

  const {
    exam,
    loading,
    error,
    startExam,
    saveAnswer,
    submitExam,
    submitting,
  } = useExam(quizId);

  useEffect(() => {
    // إذا تم إرسال الطلب بالفعل أو قيد التنفيذ، اخرج فوراً ولا تكرر
    if (hasStarted.current) return;

    // تفعيل القفل فوراً لمنع أي طلبات متزامنة أخرى
    hasStarted.current = true;

    startExam();

    // اختياري: عند الخروج من الصفحة تماماً (Unmount) نفتح القفل للمرة القادمة
    return () => {
      hasStarted.current = false;
    };
  }, [quizId]); // ابقِ على الاعتمادية كما هي

  const questions = exam?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);

  // Load saved state if the attempt matches
  useEffect(() => {
    if (!exam) return;
    const savedState = localStorage.getItem(`quiz_state_${quizId}`);
    if (savedState) {
      try {
        const { savedIndex, savedAnswers, attemptId } = JSON.parse(savedState);
        if (
          attemptId === exam.attempt_id &&
          typeof savedIndex === "number" &&
          Array.isArray(savedAnswers)
        ) {
          setCurrentIndex(savedIndex);
          setAnswers(savedAnswers);
          return;
        }
      } catch (e) {
        console.error("Failed to load saved quiz state", e);
      }
    }
    // If no saved state or mismatch, start fresh
    setCurrentIndex(0);
    setAnswers([]);
  }, [quizId, exam]);

  // Save current progress to localStorage
  useEffect(() => {
    if (exam && exam.attempt_id) {
      localStorage.setItem(
        `quiz_state_${quizId}`,
        JSON.stringify({
          savedIndex: currentIndex,
          savedAnswers: answers,
          attemptId: exam.attempt_id,
        }),
      );
    }
  }, [currentIndex, answers, exam, quizId]);
  const [showResult, setShowResult] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [submittedAttemptId, setSubmittedAttemptId] = useState(null);
  const [showAnswerReview, setShowAnswerReview] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Refs to avoid stale closures in the timer interval
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const selectedAnswerRef = useRef(selectedAnswer);
  selectedAnswerRef.current = selectedAnswer;

  const currentQuestionRef = useRef(currentQuestion);
  currentQuestionRef.current = currentQuestion;

  const submittingRef = useRef(submitting);
  submittingRef.current = submitting;

  const handleAutoSubmit = useCallback(async () => {
    if (submittingRef.current || !exam?.attempt_id) return;
    
    try {
      const curQuestion = currentQuestionRef.current;
      const selAnswer = selectedAnswerRef.current;
      if (curQuestion && selAnswer !== null) {
        await saveAnswer(curQuestion.id, selAnswer);
      }

      const result = await submitExam(exam.attempt_id);

      localStorage.removeItem(`quiz_state_${quizId}`);
      localStorage.removeItem(`quiz_timer_${quizId}_${exam.attempt_id}`);

      invalidateAttemptReview(exam.attempt_id);
      setSubmittedAttemptId(exam.attempt_id);
      setShowAnswerReview(false);
      setScoreResult(result.results);
      setShowResult(true);

      toastCustom({
        message: isArabic
          ? "انتهى الوقت المخصص للاختبار! تم إرسال إجاباتك تلقائياً."
          : "Exam duration has ended! Your answers were submitted automatically.",
        type: "warning",
        bsIcon: "bi-clock-history",
        duration: 5000,
      });
    } catch (err) {
      toastCustom({
        message: isArabic
          ? "حدث خطأ أثناء إرسال الإجابات تلقائياً بعد انتهاء الوقت"
          : "Failed to automatically submit answers after time expired.",
        type: "error",
        bsIcon: "bi-x-circle",
        duration: 5000,
      });
    }
  }, [exam?.attempt_id, quizId, isArabic, saveAnswer, submitExam]);

  // Prevent leaving tab by mistake
  useEffect(() => {
    if (!exam || showResult) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [exam, showResult]);

  const handleExitClick = useCallback(() => {
    const confirmExit = window.confirm(
      isArabic
        ? "هل أنت متأكد أنك تريد الخروج؟ قد تفقد إجاباتك الحالية."
        : "Are you sure you want to exit? You might lose your current answers."
    );
    if (confirmExit) {
      if (exam?.attempt_id) {
        localStorage.removeItem(`quiz_timer_${quizId}_${exam.attempt_id}`);
      }
      handleExit();
    }
  }, [exam?.attempt_id, quizId, isArabic]);

  const handleSelectAnswer = useCallback((choiceId) => {
    setSelectedAnswer(choiceId); // تخزين الـ id مباشرة

    // وتحديث مصفوفة الـ answers لتخزين الـ id
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = choiceId;
    setAnswers(updatedAnswers);

    // الحفظ في الـ localStorage
    localStorage.setItem(
      `quiz_state_${quizId}`,
      JSON.stringify({
        savedIndex: currentIndex,
        savedAnswers: updatedAnswers, // أصبحت تحتوي على ids
        attemptId: exam?.attempt_id,
      }),
    );
  }, [answers, currentIndex, exam?.attempt_id, quizId]);

  const handleNext = useCallback(async () => {
    // CRITICAL GUARD: must have a valid attempt before any action
    if (!exam?.attempt_id) {
      toastCustom({
        message: isArabic
          ? "الاختبار لم يُبدأ بعد، انتظر قليلاً"
          : "Exam not ready yet, please wait",
        type: "error",
        bsIcon: "bi-x-circle",
        duration: 3000,
      });
      return;
    }

    // 1. حفظ الإجابة الحالية في السيرفر ومصفوفة الإجابات المحلية
    let updatedAnswers = [...answers];

    if (currentQuestion && selectedAnswer !== null) {
      const choiceId = selectedAnswer;

      // إرسال الطلب للسيرفر للحفظ المباشر
      await saveAnswer(currentQuestion.id, choiceId);

      // تحديث مكان الإجابة في المصفوفة بناءً على الـ currentIndex لضمان دقة الترتيب
      updatedAnswers[currentIndex] = choiceId;
      setAnswers(updatedAnswers);
    }

    // 2. تحديث الـ LocalStorage بالخطوة القادمة والإجابات المحدثة لتأمين الـ Refresh
    const nextIndex = currentIndex + 1;

    if (!isLastQuestion) {
      localStorage.setItem(
        `quiz_state_${quizId}`,
        JSON.stringify({
          savedIndex: nextIndex, // نخزن الاندكس التالي عشان لما يفتح يلاقيه
          savedAnswers: updatedAnswers,
          attemptId: exam?.attempt_id,
        }),
      );
    }

    // 3. التحقق من حالة إنهاء الامتحان أو الانتقال للسؤال التالي
    if (isLastQuestion) {
      try {
        const result = await submitExam(exam.attempt_id);

        localStorage.removeItem(`quiz_state_${quizId}`);
        localStorage.removeItem(`quiz_timer_${quizId}_${exam.attempt_id}`);

        invalidateAttemptReview(exam.attempt_id);
        setSubmittedAttemptId(exam.attempt_id);
        setShowAnswerReview(false);
        setScoreResult(result.results);
        setShowResult(true);
      } catch (err) {
        toastCustom({
          message: isArabic
            ? "حدث خطأ أثناء إرسال الإجابات"
            : "Failed to submit exam",
          type: "error",
          bsIcon: "bi-x-circle",
          duration: 3000,
        });
      }
    } else {
      // الانتقال للسؤال التالي وتجهيز الاختيار للسؤال الجديد
      setCurrentIndex(nextIndex);

      // مراجعة ما إذا كان الطالب قد أجاب على السؤال التالي مسبقاً لعرض إجابته، وإلا نتركها null
      const nextQuestionAnswer = updatedAnswers[nextIndex];
      setSelectedAnswer(
        nextQuestionAnswer !== undefined ? nextQuestionAnswer : null,
      );
    }
  }, [
    answers,
    currentIndex,
    currentQuestion,
    exam?.attempt_id,
    isArabic,
    isLastQuestion,
    quizId,
    saveAnswer,
    selectedAnswer,
    submitExam,
  ]);

  const handlePrevious = useCallback(async () => {
    if (currentIndex === 0 || !exam?.attempt_id) return;

    let updatedAnswers = [...answers];

    if (currentQuestion && selectedAnswer !== null) {
      await saveAnswer(currentQuestion.id, selectedAnswer);
      updatedAnswers[currentIndex] = selectedAnswer;
      setAnswers(updatedAnswers);
    }

    const prevIndex = currentIndex - 1;

    localStorage.setItem(
      `quiz_state_${quizId}`,
      JSON.stringify({
        savedIndex: prevIndex,
        savedAnswers: updatedAnswers,
        attemptId: exam.attempt_id,
      }),
    );

    setCurrentIndex(prevIndex);
    const prevQuestionAnswer = updatedAnswers[prevIndex];
    setSelectedAnswer(
      prevQuestionAnswer !== undefined ? prevQuestionAnswer : null,
    );
  }, [
    answers,
    currentIndex,
    currentQuestion,
    exam?.attempt_id,
    quizId,
    saveAnswer,
    selectedAnswer,
  ]);

  const handleExit = useCallback(() => {
    navigate("/student/quizzes");
  }, [navigate]);

  const handleFinishWithToast = useCallback(() => {
    const isFailed = scoreResult?.status === "failed";
    toastCustom({
      message: isFailed
        ? isArabic
          ? "لم تجتز الاختبار، حاول مرة أخرى"
          : "You did not pass. Better luck next time!"
        : isArabic
          ? "مبروك! اجتزت الاختبار بنجاح"
          : "Congratulations! You passed the exam!",
      type: isFailed ? "error" : "success",
      bsIcon: isFailed ? "bi-x-circle" : "bi-check2-circle",
      duration: 4000,
    });

    if (!isFailed && scoreResult?.requires_review && scoreResult?.course_id) {
      navigate(`/student/review/${scoreResult.course_id}`);
      return;
    }

    handleExit();
  }, [scoreResult, isArabic, handleExit, navigate]);

  if (loading) {
    return (
      <div className="quiz-exam-page">
        <div
          className="quiz-exam-container d-flex justify-content-center align-items-center"
          style={{ minHeight: "300px" }}
        >
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </div>
    );
  }

  if (error || (!loading && !exam)) {
    const serverErrorMessage = error?.response?.data?.message;

    return (
      <div className="quiz-exam-page">
        <div className="quiz-exam-container">
          <div className="quiz-exam-placeholder">
            <i
              className="bi bi-exclamation-circle placeholder-icon"
              style={{ color: "#ef4444" }}
            ></i>
            <h5>
              {serverErrorMessage
                ? serverErrorMessage
                : isArabic
                  ? "الكويز غير موجود أو حدث خطأ"
                  : "Quiz not found or error occurred"}
            </h5>
            <button className="btn-continue" onClick={handleExit}>
              <i className="bi bi-arrow-left me-1"></i>
              {isArabic ? "العودة" : "Back"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (exam && questions.length === 0) {
    return (
      <div className="quiz-exam-page">
        <div className="quiz-exam-container">
          <div className="quiz-exam-placeholder">
            <i
              className="bi bi-journal-x placeholder-icon"
              style={{ color: "#f59e0b" }}
            ></i>
            <h5>
              {isArabic
                ? "لا توجد أسئلة في هذا الامتحان حالياً. تواصل مع الإدارة."
                : "This exam has no questions yet. Please contact the administrator."}
            </h5>
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
        <div
          className={`quiz-result-content ${
            showAnswerReview ? "quiz-result-content--expanded" : ""
          }`}
        >
          <h4 className="result-title">
            {isArabic ? "نتيجتك" : "Your Result"}
          </h4>

          {/* Animated Half-Circle gauge */}
          <div
            className="result-circle-wrap"
            style={{ height: 130, marginBottom: 8 }}
          >
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
                  transition:
                    "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
                {formatExamScore(scoreResult?.score ?? 0)}
              </text>
              <text
                x="100"
                y="100"
                textAnchor="middle"
                fontSize="13"
                fontWeight="500"
                fill="#999"
              >
                / {formatExamScore(scoreResult?.total_marks)}
              </text>
            </svg>
          </div>

          {/* Percentage label */}
          <p
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: strokeColor,
              margin: "0 0 6px",
            }}
          >
            {scoreResult?.percentage}
          </p>

          {/* Status label */}
          <p
            className={
              isFailed ? "result-messageFailed" : "result-messageSucsses"
            }
          >
            {isFailed
              ? isArabic
                ? "رسبت - لم تجتز الحد الأدنى"
                : "Failed — Below passing mark"
              : isArabic
                ? "مبروك! تجاوزت الحد الأدنى"
                : "Passed — Above passing mark"}
          </p>

          <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
            {!showAnswerReview ? (
              <button
                type="button"
                className="btn btn-review-action"
                onClick={() => setShowAnswerReview(true)}
              >
                <i className="bi bi-list-check me-2" />
                {t("attempt_review.view_answers")}
              </button>
            ) : null}

            <button
              className="btn-continue btn-exit"
              onClick={handleFinishWithToast}
            >
              <i className={`bi ${scoreResult?.requires_review ? "bi-star-fill" : "bi-arrow-left"} me-2`}></i>
              {!isFailed && scoreResult?.requires_review
                ? isArabic
                  ? "اترك تقييم للحصول على الشهادة"
                  : "Leave Review to Get Certificate"
                : isArabic
                  ? "خروج"
                  : "Exit"}
            </button>
          </div>

          {showAnswerReview && submittedAttemptId ? (
            <div className="mt-3 text-start">
              <AttemptReviewPanel
                role="student"
                attemptId={submittedAttemptId}
                enabled={!!submittedAttemptId}
                compact
                fullPageTo={`/student/quizzes/${quizId}/attempts/${submittedAttemptId}/review`}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-exam-page">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="quiz-exam-container">
        <div className="quiz-header d-flex justify-content-between align-items-center mb-3">
          <button className="topbar-back-btn mb-0" onClick={handleExitClick}>
            <i
              className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
            ></i>
            {isArabic ? "خروج" : "Exit"}
          </button>
          {exam && exam.duration && (
            <QuizTimer
              durationMins={parseFloat(exam.duration)}
              attemptId={exam.attempt_id}
              quizId={quizId}
              isArabic={isArabic}
              onTimeout={handleAutoSubmit}
            />
          )}
        </div>

        <div className="quiz-progress">
          <span>
            {isArabic ? "سؤال" : "Question"} {currentIndex + 1}{" "}
            {isArabic ? "من" : "of"} {totalQuestions}
          </span>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar"
              style={{
                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="quiz-question">
          <h5 className="question-text">
            {currentQuestion?.question_text || currentQuestion?.question}
          </h5>
        </div>

        <div className="quiz-options">
          {currentQuestion?.choices?.map((choice, idx) => (
            <button
              key={choice.id}
              // التعديل هنا: نقارن الـ id المخزن بالـ id الخاص بالاختيار الحالي
              className={`quiz-option ${selectedAnswer === choice.id ? "selected" : ""}`}
              onClick={() => handleSelectAnswer(choice.id)} // نمرر الـ id وليس الـ idx
            >
              <span className="option-letter">
                {String.fromCharCode(65 + idx)}{" "}
                {/* الحرف يظل ثابتاً بصرياً A, B, C */}
              </span>
              <span className="option-text">{choice.choice_text}</span>
            </button>
          ))}
        </div>

        <div className="quiz-nav-buttons">
          {currentIndex > 0 && (
            <button
              className="btn-previousQuiz"
              disabled={submitting || !exam?.attempt_id}
              onClick={handlePrevious}
            >
              <i
                className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"} ${isArabic ? "ms-2" : "me-2"}`}
              ></i>
              {isArabic ? "السابق" : "Previous"}
            </button>
          )}
          <button
            className="btn-continueQuiz"
            disabled={selectedAnswer === null || submitting || !exam?.attempt_id}
            onClick={handleNext}
          >
            {submitting ? (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            ) : null}
            {isLastQuestion
              ? isArabic
                ? "إنهاء"
                : "Finish"
              : isArabic
                ? "التالي"
                : "Next"}
            <i
              className={`bi ${isLastQuestion ? "bi-check2-all" : "bi-arrow-right"} ms-2`}
            ></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizExamPage;