import { useState, useCallback, useEffect, useRef } from "react";
import {
  startExam as startExamApi,
  saveExamAnswer,
  submitExam as submitExamApi,
  getAttemptReview,
  getExamTimeStatus,
} from "../services/dashboardService";
import { toastCustom } from "../../../components/shared/Toaster/toaster";
import { getApiErrorMessage } from "../../../utils/apiErrors";
import {
  logStartResponse,
  logTimeStatusResponse,
} from "../utils/examTimerDiagnostic";
import {
  bindExamJourneyAttempt,
  clearExamJourneyAttempt,
  flushExamJourneyEvents,
  trackExamJourneyEvent,
} from "../utils/examJourneyLog";

export const mapExamResults = (results) => {
  if (!results) return null;

  const totalMarks = results.total_marks > 0 ? results.total_marks : 1;
  const score = results.score ?? 0;
  const isAwaitingGrading = results.status === "awaiting_grading";
  const percentage =
    results.percentage ??
    (isAwaitingGrading
      ? null
      : `${Math.round((parseFloat(score) / totalMarks) * 100)}%`);

  return {
    ...results,
    percentage,
    is_passed: isAwaitingGrading ? null : results.is_passed,
  };
};

export const useExam = (examId) => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const saveInFlightRef = useRef(new Map());
  const submitInFlightRef = useRef(null);
  const finalizingAttemptIdRef = useRef(null);
  const finalizeFlightRef = useRef(null);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  useEffect(() => {
    setExam(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
    setIsSavingAnswer(false);
    saveInFlightRef.current.clear();
    submitInFlightRef.current = null;
    finalizingAttemptIdRef.current = null;
    finalizeFlightRef.current = null;
    clearExamJourneyAttempt();
  }, [examId]);

  const waitForPendingSaves = useCallback(async (attemptId) => {
    if (!attemptId) {
      return;
    }

    const prefix = `${attemptId}:`;
    const pending = [...saveInFlightRef.current.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([, promise]) => promise);

    if (pending.length === 0) {
      return;
    }

    const results = await Promise.allSettled(pending);
    const rejected = results.find((result) => result.status === "rejected");
    if (rejected) {
      throw rejected.reason;
    }
  }, []);

  /**
   * Serializes submit prep/submit for one attempt: blocks new saves, dedupes concurrent callers.
   * Lock is released when the callback finishes (success or failure) so retries can save again.
   * QuizExamPage holds one ongoing attempt_id at a time; a different attemptId waits for any
   * in-flight finalization to finish, then starts its own flight (no shared Promise across ids).
   */
  const withAttemptFinalization = useCallback(async (attemptId, callback) => {
    if (!attemptId) {
      return callback();
    }

    if (finalizeFlightRef.current) {
      if (finalizingAttemptIdRef.current === attemptId) {
        return finalizeFlightRef.current;
      }

      try {
        await finalizeFlightRef.current;
      } catch {
        // Previous finalization failed; start a new flight for this attempt.
      }
    }

    const flight = (async () => {
      finalizingAttemptIdRef.current = attemptId;
      try {
        return await callback();
      } finally {
        if (finalizingAttemptIdRef.current === attemptId) {
          finalizingAttemptIdRef.current = null;
        }
        finalizeFlightRef.current = null;
      }
    })();

    finalizeFlightRef.current = flight;
    return flight;
  }, []);

  const startExam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setExam(null);
      trackExamJourneyEvent("START_API_CALL", { exam_id: examId });
      const res = await startExamApi(examId);
      logStartResponse(res.data?.data ?? res.data);
      const data = res.data.data;
      bindExamJourneyAttempt(data?.attempt_id);
      setExam(data);
    } catch (err) {
      console.error(err);
      trackExamJourneyEvent("START_API_FAIL", {
        status: err.response?.status ?? "unknown",
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const syncExamTime = useCallback(async (attemptId) => {
    if (!attemptId) {
      return null;
    }

    try {
      const res = await getExamTimeStatus(attemptId);
      const data = res.data?.data ?? res.data;

      if (!data) {
        return null;
      }

      logTimeStatusResponse(data);

      setExam((prev) =>
        prev
          ? {
              ...prev,
              ...data,
              attempt_id: data.attempt_id ?? prev.attempt_id,
            }
          : prev,
      );

      return data;
    } catch (err) {
      console.error("Failed to sync exam time", err);
      return null;
    }
  }, []);

  const saveAnswer = useCallback(async (
    questionId,
    answerValue,
    questionType = "mcq",
    options = {},
  ) => {
    if (!exam?.attempt_id) {
      console.warn("saveAnswer skipped — attempt_id not available yet");
      return;
    }

    const { bypassFinalizeLock = false } = options;

    if (
      !bypassFinalizeLock &&
      finalizingAttemptIdRef.current === exam.attempt_id
    ) {
      const blocked = Object.assign(
        new Error("Answer save blocked during exam submission"),
        { code: "SAVE_BLOCKED_DURING_FINALIZATION" },
      );
      return Promise.reject(blocked);
    }

    const key = `${exam.attempt_id}:${questionId}`;
    const inFlight = saveInFlightRef.current.get(key);

    if (inFlight) {
      return inFlight;
    }

    const payload = {
      attempt_id: exam.attempt_id,
      question_id: questionId,
    };

    if (questionType === "essay") {
      payload.answer_text = answerValue;
    } else {
      payload.choice_id = answerValue;
    }

    const request = (async () => {
      setIsSavingAnswer(true);

      try {
        await saveExamAnswer(payload);
      } catch (err) {
        console.error("Failed to save answer", err);

        if (err.response?.status !== 403) {
          toastCustom({
            message: getApiErrorMessage(err, "Failed to save answer"),
            type: "error",
            bsIcon: "bi-x-circle",
            duration: 4000,
          });
        }

        throw err;
      } finally {
        saveInFlightRef.current.delete(key);
        setIsSavingAnswer(saveInFlightRef.current.size > 0);
      }
    })();

    saveInFlightRef.current.set(key, request);

    return request;
  }, [exam?.attempt_id]);

  const recoverClosedAttempt = useCallback(async (attemptId) => {
    if (!attemptId) {
      return null;
    }

    try {
      const res = await getAttemptReview(attemptId);
      const review = res.data?.data ?? res.data;

      if (!review?.status || review.status === "ongoing") {
        return null;
      }

      const totalMarks = review.attempt_max_marks ?? review.total_marks ?? 1;
      const score = review.score ?? 0;

      return mapExamResults({
        score,
        total_marks: totalMarks,
        status: review.status,
        is_passed:
          review.status === "awaiting_grading"
            ? null
            : review.is_passed ?? review.status === "passed",
      });
    } catch (err) {
      console.error("Failed to recover closed attempt", err);
      return null;
    }
  }, []);

  const submitExam = useCallback(async (attemptId) => {
    if (!attemptId) {
      throw new Error("Cannot submit: attempt_id is missing");
    }

    if (submitInFlightRef.current) {
      return submitInFlightRef.current;
    }

    const request = (async () => {
      try {
        setSubmitting(true);
        trackExamJourneyEvent("SUBMIT_CLICK", { attempt_id: attemptId });

        const res = await submitExamApi(attemptId);

        return {
          ...res.data,
          results: mapExamResults(res.data?.results),
        };
      } catch (err) {
        if (err.response?.status === 403) {
          const recovered = await recoverClosedAttempt(attemptId);
          if (recovered) {
            return { results: recovered };
          }
        }

        console.error("Submit failed:", err);
        throw err;
      } finally {
        await flushExamJourneyEvents();
        setSubmitting(false);
        submitInFlightRef.current = null;
      }
    })();

    submitInFlightRef.current = request;
    return request;
  }, [recoverClosedAttempt]);

  return {
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
  };
};
