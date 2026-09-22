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
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  useEffect(() => {
    setExam(null);
    setError(null);
    setLoading(false);
    setSubmitting(false);
    setIsSavingAnswer(false);
    saveInFlightRef.current.clear();
  }, [examId]);

  const startExam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setExam(null);
      const res = await startExamApi(examId);
      setExam(res.data.data);
    } catch (err) {
      console.error(err);
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

  const saveAnswer = useCallback(async (questionId, answerValue, questionType = "mcq") => {
    if (!exam?.attempt_id) {
      console.warn("saveAnswer skipped — attempt_id not available yet");
      return;
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

    try {
      setSubmitting(true);

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
      setSubmitting(false);
    }
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
  };
};
