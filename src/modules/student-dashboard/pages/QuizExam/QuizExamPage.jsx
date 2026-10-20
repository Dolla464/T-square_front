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
import {
  getCourseDetails,
  getStudentExams,
  recordExamQuestionTime,
} from "../../services/dashboardService";
import {
  getCompletedAttemptId,
  markQuizAttemptCompleted,
  clearQuizAttemptCompleted,
} from "../../utils/quizExamSession";
import { getServerExpiryAction } from "../../utils/examTimerUtils";
import QuizTimer from "./QuizTimer";
import { trackExamJourneyEvent } from "../../utils/examJourneyLog";
import "../../../shared-dashboard/components/AttemptAnswerReview/attemptReview.css";
import "../../../shared-dashboard/components/QuestionContent/questionContent.css";
import "../../styles/dashboardShared.css";
import { isArabicLocale } from "../../../../utils/isArabicLocale";

const confirmLeaveExam = (t) =>
  showConfirmCustom({
    title: t("quiz_exam.leave_exam_title"),
    message: t("quiz_exam.leave_exam_message"),
    icon: "warning",
    variant: "danger",
  });

const isAttemptFailed = (status) =>
  status === "failed" || status === "timed_out";

const isAwaitingGrading = (status) => status === "awaiting_grading";

const isEssayQuestion = (question) => question?.type === "essay";

function QuizExamPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const initRequestIdRef = useRef(0);
  const hasAutoSubmittedRef = useRef(false);
  const leaveDialogOpenRef = useRef(false);
  const attemptFinalizedRef = useRef(false);
  const navigationInFlightRef = useRef(false);
  const expiryVerificationRef = useRef(null);
  const isInitializingRef = useRef(true);
  const loadingRef = useRef(false);
  const { i18n, t } = useTranslation("studentDashboard");
  const isArabic = isArabicLocale(i18n.language);

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
    waitForPendingSaves,
    withAttemptFinalization,
  } = useExam(quizId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [courseEnrollmentStatus, setCourseEnrollmentStatus] = useState(null);
  const [submittedAttemptId, setSubmittedAttemptId] = useState(null);
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [attemptFinalized, setAttemptFinalized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  isInitializingRef.current = isInitializing;
  loadingRef.current = loading;

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
    Boolean(exam?.attempt_id) &&
    !attemptFinalizedRef.current &&
    !showResult;
  const isExamContentReady =
    !isInitializing &&
    !loading &&
    exam?.status === "ongoing" &&
    questions.length > 0;

  const isExamInProgress =
    Boolean(exam?.attempt_id) &&
    exam?.status === "ongoing" &&
    !showResult &&
    !attemptFinalized &&
    isExamContentReady;

  useExamIntegrityMonitor({
    attemptId: exam?.attempt_id,
    enabled: isExamInProgress,
  });

  useEffect(() => {
    if (!exam?.attempt_id || exam?.status !== "ongoing") {
      return;
    }

    trackExamJourneyEvent("PAGE_MOUNT", { quiz_id: quizId });
  }, [exam?.attempt_id, exam?.status, quizId]);

  useEffect(() => {
    if (!isExamInProgress) {
      return undefined;
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        trackExamJourneyEvent("VISIBILITY_HIDDEN");
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isExamInProgress]);

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

  const questionShownAtRef = useRef(null);

  const flushQuestionTime = useCallback(() => {
    const curQuestion = currentQuestionRef.current;
    const attemptId = examAttemptIdRef.current;

    if (!curQuestion || !attemptId || questionShownAtRef.current == null) {
      return;
    }

    const elapsed = Math.round((Date.now() - questionShownAtRef.current) / 1000);

    if (elapsed <= 0) {
      questionShownAtRef.current = Date.now();
      return;
    }

    questionShownAtRef.current = Date.now();

    recordExamQuestionTime({
      attempt_id: attemptId,
      question_id: curQuestion.id,
      time_spent_seconds: elapsed,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (
      !currentQuestion?.id ||
      !exam?.attempt_id ||
      exam?.status !== "ongoing" ||
      attemptFinalized ||
      showResult
    ) {
      questionShownAtRef.current = null;
      return;
    }

    questionShownAtRef.current = Date.now();
  }, [
    currentQuestion?.id,
    exam?.attempt_id,
    exam?.status,
    attemptFinalized,
    showResult,
  ]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResult(false);
    setScoreResult(null);
    setCourseEnrollmentStatus(null);
    setSubmittedAttemptId(null);
    setShowAnswerReview(false);
    setAttemptFinalized(false);
    attemptFinalizedRef.current = false;
    hasAutoSubmittedRef.current = false;
    initRequestIdRef.current += 1;
    setIsInitializing(true);
  }, [quizId]);

  useEffect(() => {
    if (
      !showResult ||
      !scoreResult?.requires_review ||
      !scoreResult?.course_id
    ) {
      setCourseEnrollmentStatus(null);
      return undefined;
    }

    let cancelled = false;

    getCourseDetails(scoreResult.course_id)
      .then((res) => {
        if (cancelled) {
          return;
        }

        setCourseEnrollmentStatus(
          res.data?.data?.enrollment?.status ?? null,
        );
      })
      .catch(() => {
        if (!cancelled) {
          setCourseEnrollmentStatus(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [showResult, scoreResult]);

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

  const applySubmitResult = useCallback(
    (attemptId, results, { showResultUi = true } = {}) => {
      sessionStorage.removeItem(`quiz_state_${quizId}`);
      invalidateAttemptReview(attemptId);
      markAttemptFinalized(attemptId);
      setSubmittedAttemptId(attemptId);
      setShowAnswerReview(false);
      setScoreResult(mapExamResults(results));
      if (showResultUi) {
        setShowResult(true);
      }
    },
    [quizId, markAttemptFinalized],
  );

  const syncClosedAttempt = useCallback(
    async (attemptId, { showResultUi = true } = {}) => {
      if (!attemptId || attemptFinalizedRef.current) {
        return true;
      }

      const results = await recoverClosedAttempt(attemptId);
      if (!results) {
        return false;
      }

      hasAutoSubmittedRef.current = true;
      applySubmitResult(attemptId, results, { showResultUi });
      return true;
    },
    [applySubmitResult, recoverClosedAttempt],
  );

  const persistCurrentAnswer = useCallback(async () => {
    // submittingRef: skip only for concurrent callers; finalizeAttempt persists before submitExam.
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
        { bypassFinalizeLock: true },
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
    async ({
      showToast = true,
      toastVariant = "default",
      showResultUi = true,
    } = {}) => {
      const attemptId = examAttemptIdRef.current;

      if (
        hasAutoSubmittedRef.current ||
        submittingRef.current ||
        attemptFinalizedRef.current ||
        !attemptId
      ) {
        return false;
      }

      if (isInitializingRef.current || loadingRef.current) {
        return false;
      }

      return withAttemptFinalization(attemptId, async () => {
        if (
          hasAutoSubmittedRef.current ||
          submittingRef.current ||
          attemptFinalizedRef.current
        ) {
          return false;
        }

        flushQuestionTime();

        try {
          await waitForPendingSaves(attemptId);

          const saved = await persistCurrentAnswer();
          if (!saved) {
            return false;
          }

          hasAutoSubmittedRef.current = true;

          const result = await submitExam(attemptId);
          applySubmitResult(attemptId, result.results, { showResultUi });

          if (showToast) {
            const toastConfig =
              toastVariant === "timeout"
                ? {
                    message: t("quiz_exam.timeout_toast"),
                    type: "warning",
                    bsIcon: "bi-clock-history",
                  }
                : {
                    message: t("quiz_exam.submitted_toast"),
                    type: "success",
                    bsIcon: "bi-check2-circle",
                  };

            toastCustom({ ...toastConfig, duration: 5000 });
          }

          return true;
        } catch {
          if (hasAutoSubmittedRef.current) {
            if (attemptId) {
              const recovered = await syncClosedAttempt(attemptId, {
                showResultUi,
              });
              if (recovered) {
                return true;
              }
            }

            hasAutoSubmittedRef.current = false;
            toastCustom({
              message: t("quiz_exam.submit_error"),
              type: "error",
              bsIcon: "bi-x-circle",
              duration: 5000,
            });
          }

          return false;
        }
      });
    },
    [
      applySubmitResult,
      flushQuestionTime,
      persistCurrentAnswer,
      t,
      submitExam,
      syncClosedAttempt,
      waitForPendingSaves,
      withAttemptFinalization,
    ],
  );

  finalizeAttemptRef.current = finalizeAttempt;

  const reconcileServerTimeStatus = useCallback(
    async (attemptId, { source = "sync" } = {}) => {
      if (
        !attemptId ||
        attemptFinalizedRef.current ||
        showResult ||
        hasAutoSubmittedRef.current
      ) {
        return "skipped";
      }

      if (expiryVerificationRef.current) {
        return expiryVerificationRef.current;
      }

      const verification = (async () => {
        trackExamJourneyEvent("TIMER_EXPIRY_CHECK", { source });

        const data = await syncExamTime(attemptId);
        if (!data) {
          return "unknown";
        }

        const expiryAction = getServerExpiryAction(data);

        if (expiryAction === "closed_with_results") {
          hasAutoSubmittedRef.current = true;
          applySubmitResult(attemptId, data.results);
          toastCustom({
            message: t("quiz_exam.timeout_toast"),
            type: "warning",
            bsIcon: "bi-clock-history",
            duration: 5000,
          });
          return "closed_with_results";
        }

        if (expiryAction === "closed") {
          await syncClosedAttempt(attemptId);
          return "closed";
        }

        if (expiryAction === "expired") {
          await finalizeAttempt({ showToast: true, toastVariant: "timeout" });
          return "expired";
        }

        return "ongoing";
      })();

      expiryVerificationRef.current = verification.finally(() => {
        expiryVerificationRef.current = null;
      });

      return expiryVerificationRef.current;
    },
    [
      applySubmitResult,
      finalizeAttempt,
      showResult,
      syncClosedAttempt,
      syncExamTime,
      t,
    ],
  );

  const handleExpirySuspected = useCallback(
    async ({ source } = {}) => {
      if (hasAutoSubmittedRef.current || showResult) {
        return;
      }

      const attemptId = examAttemptIdRef.current;
      if (!attemptId) {
        return;
      }

      await reconcileServerTimeStatus(attemptId, { source: source ?? "timer" });
    },
    [reconcileServerTimeStatus, showResult],
  );

  const handleTimerSync = useCallback(async () => {
    const attemptId = examAttemptIdRef.current;
    if (!attemptId || attemptFinalizedRef.current || showResult) {
      return;
    }

    await reconcileServerTimeStatus(attemptId, { source: "sync" });
  }, [reconcileServerTimeStatus, showResult]);

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

    confirmLeaveExam(t).then(async (confirmed) => {
      leaveDialogOpenRef.current = false;

      if (confirmed) {
        if (isInitializingRef.current || loadingRef.current) {
          trackExamJourneyEvent("LEAVE_DURING_INIT", { quiz_id: quizId });
          blocker.proceed();
          return;
        }

        trackExamJourneyEvent("LEAVE_CONFIRMED", { quiz_id: quizId });
        const finalized = await finalizeAttemptRef.current?.({
          showToast: false,
          showResultUi: false,
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
  }, [blocker.state, blocker.proceed, blocker.reset, quizId, t]);

  const handleExit = useCallback(() => {
    navigate("/student/quizzes", { state: { refreshQuizzes: true } });
  }, [navigate]);

  const handleExitClick = useCallback(() => {
    navigate("/student/quizzes", { state: { refreshQuizzes: true } });
  }, [navigate]);

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
          message: t("quiz_exam.not_ready"),
          type: "error",
          bsIcon: "bi-x-circle",
          duration: 3000,
        });
      }
      return;
    }

    flushQuestionTime();

    let updatedAnswers = { ...answers };

    if (currentQuestion && !isLastQuestion) {
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

    if (isLastQuestion) {
      await finalizeAttempt({ showToast: true, toastVariant: "default" });
      return;
    }

    sessionStorage.setItem(
      `quiz_state_${quizId}`,
      JSON.stringify({
        savedIndex: nextIndex,
        savedAnswers: updatedAnswers,
        attemptId: exam?.attempt_id,
      }),
    );

    setCurrentIndex(nextIndex);
    const nextQuestion = questions[nextIndex];
    setSelectedAnswer(
      nextQuestion
        ? isEssayQuestion(nextQuestion)
          ? updatedAnswers[nextQuestion.id] ?? ""
          : updatedAnswers[nextQuestion.id] ?? null
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
    finalizeAttempt,
    flushQuestionTime,
    isLastQuestion,
    persistCurrentAnswer,
    quizId,
    questions,
    selectedAnswer,
    t,
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

    flushQuestionTime();

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
    flushQuestionTime,
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
        ? t("quiz_exam.finish_failed_toast")
        : t("quiz_exam.finish_passed_toast"),
      type: isFailed ? "error" : "success",
      bsIcon: isFailed ? "bi-x-circle" : "bi-check2-circle",
      duration: 4000,
    });

    const enrollmentCompleted = courseEnrollmentStatus === "completed";

    if (
      !isFailed &&
      scoreResult?.requires_review &&
      scoreResult?.course_id &&
      enrollmentCompleted
    ) {
      navigate(`/student/review/${scoreResult.course_id}`);
      return;
    }

    handleExit();
  }, [scoreResult, courseEnrollmentStatus, t, handleExit, navigate]);

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
                : t("quiz_exam.not_found")}
            </h5>
            <button className="btn-continue" onClick={handleExit}>
              <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"} me-1`}></i>
              {t("quiz_exam.back")}
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
              {t("quiz_exam.no_questions")}
            </h5>
            <button className="btn-continue" onClick={handleExit}>
              <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"} me-1`}></i>
              {t("quiz_exam.back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const pendingGrading = isAwaitingGrading(scoreResult?.status);
    const isFailed = isAttemptFailed(scoreResult?.status);
    const enrollmentCompleted = courseEnrollmentStatus === "completed";
    const reviewActionAvailable =
      !isFailed &&
      scoreResult?.requires_review &&
      enrollmentCompleted;
    const finalExamPassedPendingEnrollment =
      !isFailed &&
      scoreResult?.requires_review &&
      courseEnrollmentStatus === "in_progress";
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
              ? t("quiz_exam.submission_received")
              : t("quiz_exam.your_result")}
          </h4>

          {pendingGrading ? (
            <div className="text-center px-3 mb-3">
              <i
                className="bi bi-hourglass-split"
                style={{ fontSize: "3rem", color: "#f59e0b" }}
              />
              <p className="mt-3 mb-2 fw-semibold">
                {t("quiz_exam.pending_grading_message")}
              </p>
              <p className="text-muted mb-0">
                {t("quiz_exam.pending_grading_notify")}
              </p>
              {scoreResult?.score != null ? (
                <p className="mt-3 mb-0">
                  {t("quiz_exam.partial_score")}{" "}
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
                    ? t("quiz_exam.timed_out_failed")
                    : t("quiz_exam.failed")
                  : t("quiz_exam.passed")}
              </p>

              {finalExamPassedPendingEnrollment ? (
                <div className="alert alert-info py-2 px-3 small text-start mt-3 mb-0">
                  <div className="fw-semibold">
                    {t("quiz_exam.final_exam_passed")}
                  </div>
                  <div>{t("quiz_exam.enrollment_pending")}</div>
                  <div className="text-muted mt-1 mb-0">
                    {t("quiz_exam.enrollment_pending_hint")}
                  </div>
                </div>
              ) : null}
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
                className={`bi ${!pendingGrading && reviewActionAvailable ? "bi-star-fill" : "bi-arrow-left"} me-2`}
              ></i>
              {!pendingGrading && reviewActionAvailable
                ? t("quiz_exam.leave_review_for_certificate")
                : t("quiz_exam.exit")}
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
            {t("quiz_exam.exit")}
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
              onExpirySuspected={handleExpirySuspected}
              onSync={handleTimerSync}
              disabled={showResult || submitting || attemptFinalized}
            />
          )}
        </div>

        <div className="quiz-progress">
          <span>
            {t("quiz_exam.question")} {currentIndex + 1}{" "}
            {t("quiz_exam.of_label")} {totalQuestions}
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
              {t("quiz_exam.your_answer")}
            </label>
            <textarea
              className="form-control"
              rows={8}
              value={selectedAnswer ?? ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={t("quiz_exam.answer_placeholder")}
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
                <span dir="auto" className="option-text">
                  {choice.choice_text}
                </span>
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
              {t("quiz_exam.previous")}
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
              ? t("quiz_exam.finish")
              : t("quiz_exam.next")}
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
