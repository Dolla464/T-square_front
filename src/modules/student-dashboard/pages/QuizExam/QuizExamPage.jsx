import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toastCustom } from "../../../../components/shared/Toaster/toaster";
import { showConfirmCustom } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { useExam, mapExamResults } from "../../hooks/useExam";
import { useExamIntegrityMonitor } from "../../hooks/useExamIntegrityMonitor";
import AttemptReviewPanel from "../../../shared-dashboard/components/AttemptAnswerReview/AttemptReviewPanel";
import QuestionContent from "../../../shared-dashboard/components/QuestionContent/QuestionContent";
import { invalidateAttemptReview } from "../../../shared-dashboard/hooks/attemptReviewCache";
import { formatExamScore } from "../../../shared-dashboard/utils/formatExamScore";
import { getStudentExams } from "../../services/dashboardService";
import {
  getCompletedAttemptId,
  markQuizAttemptCompleted,
  clearQuizAttemptCompleted,
} from "../../utils/quizExamSession";
import {
  logEndTime,
  logTimeLeft,
  logTimerInput,
  logTimerRender,
  observeEndTimeCalculation,
} from "../../utils/examTimerDiagnostic";
import "../../../shared-dashboard/components/AttemptAnswerReview/attemptReview.css";
import "../../../shared-dashboard/components/QuestionContent/questionContent.css";
import "../../styles/dashboardShared.css";

const confirmLeaveExam = (isArabic) =>
  showConfirmCustom({
    title: isArabic ? "إنهاء الامتحان" : "Leave Exam",
    message: isArabic
      ? "سيتم إرسال إجاباتك الحالية وإنهاء المحاولة. هل تريد المتابعة؟"
      : "Your current answers will be submitted and the attempt will end. Continue?",
    icon: "warning",
    variant: "danger",
  });

const isAttemptFailed = (status) =>
  status === "failed" || status === "timed_out";

const isAwaitingGrading = (status) => status === "awaiting_grading";

const isEssayQuestion = (question) => question?.type === "essay";

const QuizTimer = React.memo(
  ({
    attemptId,
    status,
    isTimedOut,
    deadlineAt,
    startedAt,
    durationMins,
    remainingSeconds,
    onTimeout,
    onSync,
    disabled,
  }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const onTimeoutRef = useRef(onTimeout);
  const hasLoggedRenderRef = useRef(false);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    logTimerInput({
      attemptId,
      status,
      isTimedOut,
      deadlineAt,
      startedAt,
      durationMins,
      remainingSeconds,
    });
  }, [
    attemptId,
    status,
    isTimedOut,
    deadlineAt,
    startedAt,
    durationMins,
    remainingSeconds,
  ]);

  const getEndTimeMs = useCallback(() => {
    if (deadlineAt) {
      const deadlineMs = new Date(deadlineAt).getTime();
      if (!Number.isNaN(deadlineMs)) {
        return deadlineMs;
      }
    }

    if (startedAt && durationMins > 0) {
      const startMs = new Date(startedAt).getTime();
      if (!Number.isNaN(startMs)) {
        return startMs + durationMins * 60 * 1000;
      }
    }

    return null;
  }, [deadlineAt, startedAt, durationMins]);

  useEffect(() => {
    if (disabled) return;

    const endTime = getEndTimeMs();
    if (!endTime && typeof remainingSeconds !== "number") return;

    const calculateTimeLeft = () => {
      if (endTime) {
        const difference = endTime - Date.now();
        return difference <= 0 ? 0 : Math.floor(difference / 1000);
      }

      return Math.max(0, remainingSeconds);
    };

    const initialTime = calculateTimeLeft();
    logEndTime(
      observeEndTimeCalculation({
        deadlineAt,
        startedAt,
        durationMins,
        remainingSeconds,
      }),
    );
    logTimeLeft({
      source: "initialization",
      timeLeft: initialTime,
      remainingSeconds,
      deadlineAt,
      startedAt,
      durationMins,
      attemptId,
      force: true,
    });
    setTimeLeft(initialTime);

    if (initialTime <= 0) {
      onTimeoutRef.current();
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      logTimeLeft({
        source: "deadline_countdown",
        timeLeft: remaining,
        remainingSeconds,
        deadlineAt,
        startedAt,
        durationMins,
        attemptId,
      });
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onTimeoutRef.current();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [deadlineAt, startedAt, durationMins, disabled, getEndTimeMs, remainingSeconds]);

  useEffect(() => {
    if (typeof remainingSeconds === "number" && !disabled) {
      const snapped = Math.max(0, remainingSeconds);
      logTimeLeft({
        source: "remaining_seconds_sync",
        timeLeft: snapped,
        remainingSeconds,
        deadlineAt,
        startedAt,
        durationMins,
        attemptId,
        force: true,
      });
      setTimeLeft(snapped);
    }
  }, [remainingSeconds, disabled]);

  useEffect(() => {
    if (!onSync || disabled) return undefined;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        onSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    const interval = setInterval(onSync, 60000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [onSync, disabled]);

  useEffect(() => {
    if (timeLeft === null) {
      return;
    }

    const shouldLogRender =
      !hasLoggedRenderRef.current ||
      (typeof durationMins === "number" &&
        durationMins > 0 &&
        timeLeft > durationMins * 60);

    if (shouldLogRender) {
      logTimerRender({ timeLeft, attemptId });
      hasLoggedRenderRef.current = true;
    }
  }, [timeLeft, durationMins, attemptId]);

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
  },
);

function QuizExamPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const initRequestIdRef = useRef(0);
  const hasAutoSubmittedRef = useRef(false);
  const leaveDialogOpenRef = useRef(false);
  const attemptFinalizedRef = useRef(false);
  const navigationInFlightRef = useRef(false);
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
    isSavingAnswer,
    recoverClosedAttempt,
    syncExamTime,
  } = useExam(quizId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [submittedAttemptId, setSubmittedAttemptId] = useState(null);
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [attemptFinalized, setAttemptFinalized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const questions = exam?.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isInteractionLocked =
    submitting ||
    attemptFinalized ||
    hasAutoSubmittedRef.current ||
    isSavingAnswer;
  const shouldBlockNavigation =
    Boolean(exam?.attempt_id) && !attemptFinalized;
  const isExamInProgress =
    Boolean(exam?.attempt_id) &&
    exam?.status === "ongoing" &&
    !showResult &&
    !attemptFinalized;

  useExamIntegrityMonitor({
    attemptId: exam?.attempt_id,
    enabled: isExamInProgress,
  });

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const selectedAnswerRef = useRef(selectedAnswer);
  selectedAnswerRef.current = selectedAnswer;

  const currentQuestionRef = useRef(currentQuestion);
  currentQuestionRef.current = currentQuestion;

  const submittingRef = useRef(submitting);
  submittingRef.current = submitting;

  const examAttemptIdRef = useRef(exam?.attempt_id);
  examAttemptIdRef.current = exam?.attempt_id;

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResult(false);
    setScoreResult(null);
    setSubmittedAttemptId(null);
    setShowAnswerReview(false);
    setAttemptFinalized(false);
    attemptFinalizedRef.current = false;
    hasAutoSubmittedRef.current = false;
    initRequestIdRef.current += 1;
    setIsInitializing(true);
  }, [quizId]);

  useEffect(() => {
    const requestId = ++initRequestIdRef.current;

    const initExam = async () => {
      try {
        let quiz = null;

        try {
          const res = await getStudentExams();
          const quizzes = res.data?.data || [];
          quiz = quizzes.find((q) => String(q.id) === String(quizId)) ?? null;
        } catch (listError) {
          console.error("Failed to load student exams before start", listError);
        }

        if (quiz?.has_ongoing_attempt) {
          clearQuizAttemptCompleted(quizId);
          if (requestId === initRequestIdRef.current) {
            await startExam();
          }
          return;
        }

        const completedAttemptId = getCompletedAttemptId(quizId);

        if (completedAttemptId) {
          const canStartNewAttempt =
            quiz && !quiz.is_locked && !quiz.has_ongoing_attempt;

          if (canStartNewAttempt) {
            clearQuizAttemptCompleted(quizId);
            if (requestId === initRequestIdRef.current) {
              await startExam();
            }
            return;
          }

          if (requestId === initRequestIdRef.current) {
            navigate(
              `/student/quizzes/${quizId}/attempts/${completedAttemptId}/review`,
              { replace: true },
            );
          }
          return;
        }

        if (requestId === initRequestIdRef.current) {
          await startExam();
        }
      } finally {
        if (requestId === initRequestIdRef.current) {
          setIsInitializing(false);
        }
      }
    };

    initExam();
  }, [quizId, startExam, navigate]);

  useEffect(() => {
    if (!exam || isInitializing || loading) return;

    if (exam.status !== "ongoing" && exam.results) {
      markQuizAttemptCompleted(quizId, exam.attempt_id);
      attemptFinalizedRef.current = true;
      setAttemptFinalized(true);
      setSubmittedAttemptId(exam.attempt_id);
      setShowAnswerReview(false);
      setScoreResult(mapExamResults(exam.results));
      setShowResult(true);
      sessionStorage.removeItem(`quiz_state_${quizId}`);
      return;
    }

    if (exam.status === "ongoing") {
      setShowResult(false);
      setScoreResult(null);
      setSubmittedAttemptId(null);
      setShowAnswerReview(false);
      setAttemptFinalized(false);
      attemptFinalizedRef.current = false;
    }

    const apiAnswers =
      exam.user_answers && typeof exam.user_answers === "object"
        ? { ...exam.user_answers }
        : {};

    const savedState = sessionStorage.getItem(`quiz_state_${quizId}`);
    if (savedState) {
      try {
        const { savedIndex, savedAnswers, attemptId } = JSON.parse(savedState);
        if (
          attemptId === exam.attempt_id &&
          typeof savedIndex === "number" &&
          savedAnswers &&
          typeof savedAnswers === "object" &&
          !Array.isArray(savedAnswers)
        ) {
          setCurrentIndex(savedIndex);
          setAnswers({ ...apiAnswers, ...savedAnswers });
          return;
        }
      } catch (e) {
        console.error("Failed to load saved quiz state", e);
      }
    }

    setCurrentIndex(0);
    setAnswers(apiAnswers);
  }, [quizId, exam, isInitializing, loading]);

  useEffect(() => {
    if (exam && exam.attempt_id && exam.status === "ongoing") {
      sessionStorage.setItem(
        `quiz_state_${quizId}`,
        JSON.stringify({
          savedIndex: currentIndex,
          savedAnswers: answers,
          attemptId: exam.attempt_id,
        }),
      );
    }
  }, [currentIndex, answers, exam, quizId]);

  useEffect(() => {
    if (currentQuestion) {
      const saved = answers[currentQuestion.id];
      setSelectedAnswer(
        isEssayQuestion(currentQuestion)
          ? saved ?? ""
          : saved ?? null,
      );
    }
  }, [currentIndex, currentQuestion?.id, answers]);

  const markAttemptFinalized = useCallback(
    (attemptId) => {
      markQuizAttemptCompleted(quizId, attemptId);
      attemptFinalizedRef.current = true;
      setAttemptFinalized(true);
    },
    [quizId],
  );

  const applySubmitResult = useCallback((attemptId, results) => {
    sessionStorage.removeItem(`quiz_state_${quizId}`);
    invalidateAttemptReview(attemptId);
    markAttemptFinalized(attemptId);
    setSubmittedAttemptId(attemptId);
    setShowAnswerReview(false);
    setScoreResult(mapExamResults(results));
    setShowResult(true);
  }, [quizId, markAttemptFinalized]);

  const syncClosedAttempt = useCallback(
    async (attemptId) => {
      if (!attemptId || attemptFinalizedRef.current) {
        return true;
      }

      const results = await recoverClosedAttempt(attemptId);
      if (!results) {
        return false;
      }

      hasAutoSubmittedRef.current = true;
      applySubmitResult(attemptId, results);
      return true;
    },
    [applySubmitResult, recoverClosedAttempt],
  );

  const persistCurrentAnswer = useCallback(async () => {
    if (
      attemptFinalizedRef.current ||
      hasAutoSubmittedRef.current ||
      submittingRef.current
    ) {
      return true;
    }

    const curQuestion = currentQuestionRef.current;
    const selAnswer = selectedAnswerRef.current;
    const attemptId = examAttemptIdRef.current;

    if (!attemptId || !curQuestion) {
      return true;
    }

    if (isEssayQuestion(curQuestion)) {
      if (!String(selAnswer ?? "").trim()) {
        return true;
      }
    } else if (selAnswer === null) {
      return true;
    }

    try {
      await saveAnswer(
        curQuestion.id,
        selAnswer,
        isEssayQuestion(curQuestion) ? "essay" : "mcq",
      );
      return true;
    } catch (err) {
      if (err.response?.status === 403) {
        return syncClosedAttempt(attemptId);
      }
      return false;
    }
  }, [saveAnswer, syncClosedAttempt]);

  const finalizeAttemptRef = useRef(null);

  const finalizeAttempt = useCallback(
    async ({ showToast = true, toastVariant = "default" } = {}) => {
      const attemptId = examAttemptIdRef.current;

      if (
        hasAutoSubmittedRef.current ||
        submittingRef.current ||
        attemptFinalizedRef.current ||
        !attemptId
      ) {
        return false;
      }

      hasAutoSubmittedRef.current = true;

      try {
        const curQuestion = currentQuestionRef.current;
        const selAnswer = selectedAnswerRef.current;

        if (curQuestion) {
          const shouldSave =
            isEssayQuestion(curQuestion)
              ? String(selAnswer ?? "").trim()
              : selAnswer !== null;
          if (shouldSave) {
          try {
            await saveAnswer(
              curQuestion.id,
              selAnswer,
              isEssayQuestion(curQuestion) ? "essay" : "mcq",
            );
          } catch (saveErr) {
            if (saveErr.response?.status !== 403) {
              throw saveErr;
            }
          }
          }
        }

        const result = await submitExam(attemptId);
        applySubmitResult(attemptId, result.results);

        if (showToast) {
          const toastConfig =
            toastVariant === "timeout"
              ? {
                  message: isArabic
                    ? "انتهى الوقت المخصص للاختبار! تم إرسال إجاباتك تلقائياً."
                    : "Exam duration has ended! Your answers were submitted automatically.",
                  type: "warning",
                  bsIcon: "bi-clock-history",
                }
              : {
                  message: isArabic
                    ? "تم إنهاء المحاولة وإرسال إجاباتك."
                    : "Your attempt has been submitted.",
                  type: "success",
                  bsIcon: "bi-check2-circle",
                };

          toastCustom({ ...toastConfig, duration: 5000 });
        }

        return true;
      } catch (err) {
        if (attemptId) {
          const recovered = await syncClosedAttempt(attemptId);
          if (recovered) {
            return true;
          }
        }

        hasAutoSubmittedRef.current = false;
        toastCustom({
          message: isArabic
            ? "حدث خطأ أثناء إرسال الإجابات"
            : "Failed to submit exam",
          type: "error",
          bsIcon: "bi-x-circle",
          duration: 5000,
        });
        return false;
      }
    },
    [applySubmitResult, isArabic, saveAnswer, submitExam, syncClosedAttempt],
  );

  finalizeAttemptRef.current = finalizeAttempt;

  const handleAutoSubmit = useCallback(async () => {
    if (hasAutoSubmittedRef.current || showResult) return;
    await finalizeAttempt({ showToast: true, toastVariant: "timeout" });
  }, [finalizeAttempt, showResult]);

  const handleTimerSync = useCallback(async () => {
    const attemptId = examAttemptIdRef.current;
    if (!attemptId || attemptFinalizedRef.current || showResult) {
      return;
    }

    const data = await syncExamTime(attemptId);
    if (!data) {
      return;
    }

    if (data.status && data.status !== "ongoing") {
      if (data.results) {
        hasAutoSubmittedRef.current = true;
        applySubmitResult(attemptId, data.results);
        toastCustom({
          message: isArabic
            ? "انتهى الوقت المخصص للاختبار! تم إرسال إجاباتك تلقائياً."
            : "Exam duration has ended! Your answers were submitted automatically.",
          type: "warning",
          bsIcon: "bi-clock-history",
          duration: 5000,
        });
      } else {
        await syncClosedAttempt(attemptId);
      }
      return;
    }

    if (data.is_timed_out || data.remaining_seconds === 0) {
      await handleAutoSubmit();
    }
  }, [
    applySubmitResult,
    handleAutoSubmit,
    isArabic,
    showResult,
    syncClosedAttempt,
    syncExamTime,
  ]);

  useEffect(() => {
    if (!shouldBlockNavigation) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldBlockNavigation]);

  const blocker = useBlocker(shouldBlockNavigation);

  useEffect(() => {
    if (blocker.state !== "blocked" || leaveDialogOpenRef.current) return;

    leaveDialogOpenRef.current = true;

    confirmLeaveExam(isArabic).then(async (confirmed) => {
      leaveDialogOpenRef.current = false;

      if (confirmed) {
        const finalized = await finalizeAttemptRef.current?.({
          showToast: false,
        });
        if (finalized) {
          blocker.proceed();
        } else {
          blocker.reset();
        }
      } else {
        blocker.reset();
      }
    });
  }, [blocker, isArabic]);

  const handleExit = useCallback(() => {
    navigate("/student/quizzes", { state: { refreshQuizzes: true } });
  }, [navigate]);

  const handleExitClick = useCallback(async () => {
    const confirmed = await confirmLeaveExam(isArabic);
    if (confirmed) {
      await finalizeAttempt({ showToast: false });
    }
  }, [finalizeAttempt, isArabic]);

  const handleAnswerChange = useCallback(
    (value) => {
      if (!currentQuestion) return;

      setSelectedAnswer(value);
      setAnswers((prev) => {
        const updatedAnswers = { ...prev, [currentQuestion.id]: value };

        sessionStorage.setItem(
          `quiz_state_${quizId}`,
          JSON.stringify({
            savedIndex: currentIndex,
            savedAnswers: updatedAnswers,
            attemptId: exam?.attempt_id,
          }),
        );

        return updatedAnswers;
      });
    },
    [currentIndex, currentQuestion, exam?.attempt_id, quizId],
  );

  const handleNext = useCallback(async () => {
    if (navigationInFlightRef.current) {
      return;
    }

    navigationInFlightRef.current = true;

    try {
    if (
      !exam?.attempt_id ||
      attemptFinalizedRef.current ||
      hasAutoSubmittedRef.current
    ) {
      if (!exam?.attempt_id) {
        toastCustom({
          message: isArabic
            ? "الاختبار لم يُبدأ بعد، انتظر قليلاً"
            : "Exam not ready yet, please wait",
          type: "error",
          bsIcon: "bi-x-circle",
          duration: 3000,
        });
      }
      return;
    }

    let updatedAnswers = { ...answers };

    if (currentQuestion) {
      const hasAnswer = isEssayQuestion(currentQuestion)
        ? String(selectedAnswer ?? "").trim()
        : selectedAnswer !== null;

      if (hasAnswer) {
        const saved = await persistCurrentAnswer();
        if (!saved) {
          return;
        }
        updatedAnswers = {
          ...updatedAnswers,
          [currentQuestion.id]: selectedAnswer,
        };
        setAnswers(updatedAnswers);
      }
    }

    if (attemptFinalizedRef.current || hasAutoSubmittedRef.current) {
      return;
    }

    const nextIndex = currentIndex + 1;

    if (!isLastQuestion) {
      sessionStorage.setItem(
        `quiz_state_${quizId}`,
        JSON.stringify({
          savedIndex: nextIndex,
          savedAnswers: updatedAnswers,
          attemptId: exam?.attempt_id,
        }),
      );
    }

    if (isLastQuestion) {
      hasAutoSubmittedRef.current = true;
      try {
        const result = await submitExam(exam.attempt_id);
        if (result?.results) {
          applySubmitResult(exam.attempt_id, result.results);
        } else {
          hasAutoSubmittedRef.current = false;
          toastCustom({
            message: isArabic
              ? "تعذر قراءة نتيجة الامتحان"
              : "Could not read exam result",
            type: "error",
            bsIcon: "bi-x-circle",
            duration: 3000,
          });
        }
      } catch (err) {
        hasAutoSubmittedRef.current = false;
        const recovered = await syncClosedAttempt(exam.attempt_id);
        if (!recovered) {
          toastCustom({
            message: isArabic
              ? "حدث خطأ أثناء إرسال الإجابات"
              : "Failed to submit exam",
            type: "error",
            bsIcon: "bi-x-circle",
            duration: 3000,
          });
        }
      }
    } else {
      setCurrentIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      setSelectedAnswer(
        nextQuestion
          ? isEssayQuestion(nextQuestion)
            ? updatedAnswers[nextQuestion.id] ?? ""
            : updatedAnswers[nextQuestion.id] ?? null
          : null,
      );
    }
    } finally {
      navigationInFlightRef.current = false;
    }
  }, [
    answers,
    applySubmitResult,
    currentIndex,
    currentQuestion,
    exam?.attempt_id,
    isArabic,
    isLastQuestion,
    persistCurrentAnswer,
    quizId,
    questions,
    selectedAnswer,
    submitExam,
    syncClosedAttempt,
  ]);

  const handlePrevious = useCallback(async () => {
    if (navigationInFlightRef.current) {
      return;
    }

    navigationInFlightRef.current = true;

    try {
    if (
      currentIndex === 0 ||
      !exam?.attempt_id ||
      attemptFinalizedRef.current ||
      hasAutoSubmittedRef.current
    ) {
      return;
    }

    let updatedAnswers = { ...answers };

    if (currentQuestion) {
      const hasAnswer = isEssayQuestion(currentQuestion)
        ? String(selectedAnswer ?? "").trim()
        : selectedAnswer !== null;

      if (hasAnswer) {
        const saved = await persistCurrentAnswer();
        if (!saved) {
          return;
        }
        updatedAnswers = {
          ...updatedAnswers,
          [currentQuestion.id]: selectedAnswer,
        };
        setAnswers(updatedAnswers);
      }
    }

    if (attemptFinalizedRef.current || hasAutoSubmittedRef.current) {
      return;
    }

    const prevIndex = currentIndex - 1;

    sessionStorage.setItem(
      `quiz_state_${quizId}`,
      JSON.stringify({
        savedIndex: prevIndex,
        savedAnswers: updatedAnswers,
        attemptId: exam.attempt_id,
      }),
    );

    setCurrentIndex(prevIndex);
    const prevQuestion = questions[prevIndex];
    setSelectedAnswer(
      prevQuestion
        ? isEssayQuestion(prevQuestion)
          ? updatedAnswers[prevQuestion.id] ?? ""
          : updatedAnswers[prevQuestion.id] ?? null
        : null,
    );
    } finally {
      navigationInFlightRef.current = false;
    }
  }, [
    answers,
    currentIndex,
    currentQuestion,
    exam?.attempt_id,
    persistCurrentAnswer,
    quizId,
    questions,
    selectedAnswer,
  ]);

  const handleFinishWithToast = useCallback(() => {
    if (isAwaitingGrading(scoreResult?.status)) {
      handleExit();
      return;
    }

    const isFailed = isAttemptFailed(scoreResult?.status);
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

  if ((isInitializing || loading) && !showResult) {
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

  if (exam && questions.length === 0 && exam.status === "ongoing") {
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
    const pendingGrading = isAwaitingGrading(scoreResult?.status);
    const isFailed = isAttemptFailed(scoreResult?.status);
    const percentage = parseFloat(scoreResult?.percentage) || 0;
    const HALF_CIRC = Math.PI * 80;
    const filled = pendingGrading ? 0 : (percentage / 100) * HALF_CIRC;
    const strokeColor = pendingGrading
      ? "#f59e0b"
      : isFailed
        ? "#ef4444"
        : "#22c55e";

    return (
      <div className="quiz-result-overlay">
        <div
          className={`quiz-result-content ${
            showAnswerReview ? "quiz-result-content--expanded" : ""
          }`}
        >
          <h4 className="result-title">
            {pendingGrading
              ? isArabic
                ? "تم إرسال إجاباتك"
                : "Submission Received"
              : isArabic
                ? "نتيجتك"
                : "Your Result"}
          </h4>

          {pendingGrading ? (
            <div className="text-center px-3 mb-3">
              <i
                className="bi bi-hourglass-split"
                style={{ fontSize: "3rem", color: "#f59e0b" }}
              />
              <p className="mt-3 mb-2 fw-semibold">
                {isArabic
                  ? "تم تسليم الامتحان بنجاح. بعض الأسئلة المقالية تحتاج تصحيحاً يدوياً من المدرّس."
                  : "Your exam was submitted successfully. Essay questions are awaiting instructor grading."}
              </p>
              <p className="text-muted mb-0">
                {isArabic
                  ? "ستصلك إشعار عند اعتماد النتيجة النهائية."
                  : "You will be notified when your final result is ready."}
              </p>
              {scoreResult?.score != null ? (
                <p className="mt-3 mb-0">
                  {isArabic ? "الدرجة الحالية (جزئية):" : "Current partial score:"}{" "}
                  <strong>
                    {formatExamScore(scoreResult.score)} /{" "}
                    {formatExamScore(scoreResult.total_marks)}
                  </strong>
                </p>
              ) : null}
            </div>
          ) : (
          <div
            className="result-circle-wrap"
            style={{ height: 130, marginBottom: 8 }}
          >
            <svg
              viewBox="0 0 200 110"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="14"
                strokeLinecap="round"
              />
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
          )}

          {!pendingGrading ? (
            <>
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

              <p
                className={
                  isFailed ? "result-messageFailed" : "result-messageSucsses"
                }
              >
                {isFailed
                  ? scoreResult?.status === "timed_out"
                    ? isArabic
                      ? "انتهى الوقت — لم تجتز الحد الأدنى"
                      : "Time expired — Below passing mark"
                    : isArabic
                      ? "رسبت - لم تجتز الحد الأدنى"
                      : "Failed — Below passing mark"
                  : isArabic
                    ? "مبروك! تجاوزت الحد الأدنى"
                    : "Passed — Above passing mark"}
              </p>
            </>
          ) : null}

          <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
            {!pendingGrading && !showAnswerReview ? (
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
              <i
                className={`bi ${!pendingGrading && !isFailed && scoreResult?.requires_review ? "bi-star-fill" : "bi-arrow-left"} me-2`}
              ></i>
              {!pendingGrading && !isFailed && scoreResult?.requires_review
                ? isArabic
                  ? "اترك تقييم للحصول على الشهادة"
                  : "Leave Review to Get Certificate"
                : isArabic
                  ? "خروج"
                  : "Exit"}
            </button>
          </div>

          {!pendingGrading && showAnswerReview && submittedAttemptId ? (
            <div className="mt-3 text-start">
              <AttemptReviewPanel
                role="student"
                attemptId={submittedAttemptId}
                enabled={!!submittedAttemptId}
                compact
                fullPageReplace
                fullPageTo={`/student/quizzes/${quizId}/attempts/${submittedAttemptId}/review`}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!isExamInProgress && !showResult && !submitting) {
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

  return (
    <div className="quiz-exam-page">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="quiz-exam-container">
        <div className="quiz-header d-flex justify-content-between align-items-center mb-3">
          <button
            type="button"
            className="topbar-back-btn mb-0"
            onClick={handleExitClick}
          >
            <i
              className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
            ></i>
            {isArabic ? "خروج" : "Exit"}
          </button>
          {exam &&
            exam.started_at &&
            (exam.deadline_at ||
              (exam.duration && parseFloat(exam.duration) > 0)) && (
            <QuizTimer
              attemptId={exam.attempt_id}
              status={exam.status}
              isTimedOut={exam.is_timed_out}
              deadlineAt={exam.deadline_at}
              startedAt={exam.started_at}
              durationMins={parseFloat(exam.duration)}
              remainingSeconds={exam.remaining_seconds}
              onTimeout={handleAutoSubmit}
              onSync={handleTimerSync}
              disabled={showResult || isInteractionLocked}
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
          <QuestionContent question={currentQuestion} />
        </div>

        {isEssayQuestion(currentQuestion) ? (
          <div className="quiz-essay-answer mb-4">
            <label className="form-label fw-semibold">
              {isArabic ? "إجابتك" : "Your Answer"}
            </label>
            <textarea
              className="form-control"
              rows={8}
              value={selectedAnswer ?? ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={
                isArabic
                  ? "اكتب إجابتك هنا (اختياري)..."
                  : "Write your answer here (optional)..."
              }
              disabled={isInteractionLocked}
            />
          </div>
        ) : (
          <div className="quiz-options">
            {currentQuestion?.choices?.map((choice, idx) => (
              <button
                key={choice.id}
                className={`quiz-option ${selectedAnswer === choice.id ? "selected" : ""}`}
                onClick={() => handleAnswerChange(choice.id)}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + idx)}{" "}
                </span>
                <span className="option-text">{choice.choice_text}</span>
              </button>
            ))}
          </div>
        )}

        <div className="quiz-nav-buttons">
          {currentIndex > 0 && (
            <button
              className="btn-previousQuiz"
              disabled={isInteractionLocked || !exam?.attempt_id}
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
            disabled={
              (!isEssayQuestion(currentQuestion) && selectedAnswer === null) ||
              isInteractionLocked ||
              !exam?.attempt_id
            }
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
