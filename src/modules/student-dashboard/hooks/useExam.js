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
import {
  ANSWER_SAVE_STATUS,
  ESSAY_AUTOSAVE_DEBOUNCE_MS,
  MCQ_AUTOSAVE_DEBOUNCE_MS,
} from "./examAnswerSaveConstants";

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

function saveKey(attemptId, questionId) {
  return `${attemptId}:${questionId}`;
}

export const useExam = (examId) => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [answerSaveByQuestion, setAnswerSaveByQuestion] = useState({});
  const saveInFlightRef = useRef(new Map());
  const submitInFlightRef = useRef(null);
  const finalizingAttemptIdRef = useRef(null);
  const finalizeFlightRef = useRef(null);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  const latestByKeyRef = useRef(new Map());
  const laneFlightRef = useRef(new Map());
  const debounceTimersRef = useRef(new Map());
  const debouncedPendingRef = useRef(new Map());
  const attemptIdRef = useRef(null);
  const examIdRef = useRef(examId);
  const startGenerationRef = useRef(0);

  examIdRef.current = examId;

  useEffect(() => {
    attemptIdRef.current = exam?.attempt_id ?? null;
  }, [exam?.attempt_id]);

  const clearDebounceState = useCallback(() => {
    for (const timer of debounceTimersRef.current.values()) {
      clearTimeout(timer);
    }
    debounceTimersRef.current.clear();
    debouncedPendingRef.current.clear();
  }, []);

  const resetSaveLanes = useCallback(() => {
    clearDebounceState();
    latestByKeyRef.current.clear();
    laneFlightRef.current.clear();
    saveInFlightRef.current.clear();
    setAnswerSaveByQuestion({});
    setIsSavingAnswer(false);
  }, [clearDebounceState]);

  useEffect(() => {
    startGenerationRef.current += 1;
    setExam(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
    resetSaveLanes();
    submitInFlightRef.current = null;
    finalizingAttemptIdRef.current = null;
    finalizeFlightRef.current = null;
    clearExamJourneyAttempt();
  }, [examId, resetSaveLanes]);

  useEffect(() => {
    return () => {
      clearDebounceState();
    };
  }, [clearDebounceState]);

  const patchAnswerSaveState = useCallback((questionId, patch) => {
    setAnswerSaveByQuestion((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? { status: ANSWER_SAVE_STATUS.IDLE }),
        ...patch,
      },
    }));
  }, []);

  const startSaveLane = useCallback(
    (attemptId, questionId, options = {}) => {
      const key = saveKey(attemptId, questionId);
      const existing = laneFlightRef.current.get(key);
      if (existing) {
        return existing;
      }

      const { bypassFinalizeLock = false } = options;
      const laneAttemptId = attemptId;

      const applyLanePatch = (qId, patch) => {
        if (attemptIdRef.current !== laneAttemptId) {
          return;
        }
        patchAnswerSaveState(qId, patch);
      };

      const flight = (async () => {
        setIsSavingAnswer(true);
        try {
          while (true) {
            const snap = latestByKeyRef.current.get(key);
            if (!snap) {
              return;
            }

            const { value, questionType, revision } = snap;

            if (
              !bypassFinalizeLock &&
              finalizingAttemptIdRef.current === attemptId
            ) {
              const blocked = Object.assign(
                new Error("Answer save blocked during exam submission"),
                { code: "SAVE_BLOCKED_DURING_FINALIZATION" },
              );
              throw blocked;
            }

            applyLanePatch(questionId, {
              status: ANSWER_SAVE_STATUS.SAVING,
              revision,
              value,
            });

            const payload = {
              attempt_id: attemptId,
              question_id: questionId,
            };

            if (questionType === "essay") {
              payload.answer_text = value;
            } else {
              payload.choice_id = value;
            }

            try {
              await saveExamAnswer(payload);
            } catch (err) {
              console.error("Failed to save answer", err);
              applyLanePatch(questionId, {
                status: ANSWER_SAVE_STATUS.ERROR,
                revision,
                value,
              });

              if (
                attemptIdRef.current === laneAttemptId &&
                err.response?.status !== 403
              ) {
                toastCustom({
                  message: getApiErrorMessage(err, "Failed to save answer"),
                  type: "error",
                  bsIcon: "bi-x-circle",
                  duration: 4000,
                });
              }

              throw err;
            }

            const after = latestByKeyRef.current.get(key);
            if (!after || after.revision === revision) {
              applyLanePatch(questionId, {
                status: ANSWER_SAVE_STATUS.SAVED,
                revision,
                persistedRevision: revision,
                value,
              });
              return;
            }
          }
        } finally {
          if (laneFlightRef.current.get(key) === flight) {
            laneFlightRef.current.delete(key);
            saveInFlightRef.current.delete(key);
            if (attemptIdRef.current === laneAttemptId) {
              setIsSavingAnswer(saveInFlightRef.current.size > 0);
            }
          }
        }
      })();

      laneFlightRef.current.set(key, flight);
      saveInFlightRef.current.set(key, flight);
      setIsSavingAnswer(true);

      return flight;
    },
    [patchAnswerSaveState],
  );

  const saveAnswer = useCallback(
    async (questionId, answerValue, questionType = "mcq", options = {}) => {
      const attemptId = exam?.attempt_id;
      if (!attemptId) {
        console.warn("saveAnswer skipped — attempt_id not available yet");
        return;
      }

      if (attemptIdRef.current !== attemptId) {
        return;
      }

      const { bypassFinalizeLock = false, clientRevision = null } = options;

      if (
        !bypassFinalizeLock &&
        finalizingAttemptIdRef.current === attemptId
      ) {
        const blocked = Object.assign(
          new Error("Answer save blocked during exam submission"),
          { code: "SAVE_BLOCKED_DURING_FINALIZATION" },
        );
        return Promise.reject(blocked);
      }

      const key = saveKey(attemptId, questionId);
      const previousRevision =
        latestByKeyRef.current.get(key)?.revision ?? 0;
      const revision =
        clientRevision != null && Number.isFinite(Number(clientRevision))
          ? Number(clientRevision)
          : previousRevision + 1;

      latestByKeyRef.current.set(key, {
        value: answerValue,
        questionType,
        revision,
      });

      patchAnswerSaveState(questionId, {
        status: ANSWER_SAVE_STATUS.SAVING,
        revision,
        value: answerValue,
      });

      return startSaveLane(attemptId, questionId, options);
    },
    [exam?.attempt_id, patchAnswerSaveState, startSaveLane],
  );

  const scheduleAutosave = useCallback(
    (questionId, answerValue, questionType = "mcq", clientRevision = null) => {
      const attemptId = exam?.attempt_id;
      if (!attemptId || attemptIdRef.current !== attemptId) {
        return;
      }

      if (
        finalizingAttemptIdRef.current === attemptId ||
        submitInFlightRef.current
      ) {
        return;
      }

      const existingTimer = debounceTimersRef.current.get(questionId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      debouncedPendingRef.current.set(questionId, {
        value: answerValue,
        questionType,
        attemptId,
        clientRevision,
      });

      const delay =
        questionType === "essay"
          ? ESSAY_AUTOSAVE_DEBOUNCE_MS
          : MCQ_AUTOSAVE_DEBOUNCE_MS;

      const timer = setTimeout(() => {
        debounceTimersRef.current.delete(questionId);
        const pending = debouncedPendingRef.current.get(questionId);
        debouncedPendingRef.current.delete(questionId);

        if (
          !pending ||
          pending.attemptId !== attemptIdRef.current ||
          finalizingAttemptIdRef.current === pending.attemptId
        ) {
          return;
        }

        void saveAnswer(questionId, pending.value, pending.questionType, {
          clientRevision: pending.clientRevision,
        });
      }, delay);

      debounceTimersRef.current.set(questionId, timer);
    },
    [exam?.attempt_id, saveAnswer],
  );

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

  const flushAutosavesWithWait = useCallback(
    async (
      attemptId,
      { bypassFinalizeLock = false, exceptQuestionId = null } = {},
    ) => {
      for (const timer of debounceTimersRef.current.values()) {
        clearTimeout(timer);
      }

      const flushPromises = [];
      for (const [questionId, pending] of debouncedPendingRef.current.entries()) {
        debounceTimersRef.current.delete(questionId);
        if (
          exceptQuestionId != null &&
          String(exceptQuestionId) === String(questionId)
        ) {
          debouncedPendingRef.current.delete(questionId);
          continue;
        }
        if (pending.attemptId === attemptId) {
          flushPromises.push(
            saveAnswer(questionId, pending.value, pending.questionType, {
              bypassFinalizeLock,
              clientRevision: pending.clientRevision,
            }),
          );
        }
      }
      debouncedPendingRef.current.clear();

      if (flushPromises.length > 0) {
        const results = await Promise.allSettled(flushPromises);
        const rejected = results.find((r) => r.status === "rejected");
        if (rejected) {
          throw rejected.reason;
        }
      }

      await waitForPendingSaves(attemptId);
    },
    [saveAnswer, waitForPendingSaves],
  );

  const flushAutosaveForQuestion = useCallback(
    async (questionId) => {
      const attemptId = exam?.attempt_id;
      if (!attemptId) {
        return;
      }

      const timer = debounceTimersRef.current.get(questionId);
      if (timer) {
        clearTimeout(timer);
        debounceTimersRef.current.delete(questionId);
      }

      const pending = debouncedPendingRef.current.get(questionId);
      if (pending && pending.attemptId === attemptId) {
        debouncedPendingRef.current.delete(questionId);
        await saveAnswer(questionId, pending.value, pending.questionType, {
          clientRevision: pending.clientRevision,
        });
      }
    },
    [exam?.attempt_id, saveAnswer],
  );

  /**
   * Serializes submit prep/submit for one attempt: blocks new saves, dedupes concurrent callers.
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
    const requestedExamId = examIdRef.current;
    const generation = ++startGenerationRef.current;

    const isCurrentStartRequest = () =>
      startGenerationRef.current === generation &&
      examIdRef.current === requestedExamId;

    try {
      setLoading(true);
      setError(null);
      setExam(null);
      resetSaveLanes();
      trackExamJourneyEvent("START_API_CALL", { exam_id: requestedExamId });
      const res = await startExamApi(requestedExamId);
      if (!isCurrentStartRequest()) {
        return;
      }
      logStartResponse(res.data?.data ?? res.data);
      const data = res.data.data;
      bindExamJourneyAttempt(data?.attempt_id);
      setExam(data);
    } catch (err) {
      if (!isCurrentStartRequest()) {
        return;
      }
      console.error(err);
      trackExamJourneyEvent("START_API_FAIL", {
        status: err.response?.status ?? "unknown",
      });
      setError(err);
    } finally {
      if (isCurrentStartRequest()) {
        setLoading(false);
      }
    }
  }, [resetSaveLanes]);

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

      setExam((prev) => {
        if (!prev) {
          return prev;
        }
        if (
          data.attempt_id != null &&
          data.attempt_id !== prev.attempt_id
        ) {
          return prev;
        }
        return {
          ...prev,
          ...data,
          attempt_id: data.attempt_id ?? prev.attempt_id,
        };
      });

      return data;
    } catch (err) {
      console.error("Failed to sync exam time", err);
      return null;
    }
  }, []);

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
    scheduleAutosave,
    flushAutosaves: flushAutosavesWithWait,
    flushAutosaveForQuestion,
    submitExam,
    submitting,
    isSavingAnswer,
    answerSaveByQuestion,
    recoverClosedAttempt,
    syncExamTime,
    waitForPendingSaves,
    withAttemptFinalization,
  };
};
