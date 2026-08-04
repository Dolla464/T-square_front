import { useState, useCallback } from "react";
import { startExam as startExamApi, saveExamAnswer, submitExam as submitExamApi, getAttemptReview } from "../services/dashboardService";
import { toastCustom } from "../../../components/shared/Toaster/toaster";
import { getApiErrorMessage } from "../../../utils/apiErrors";

export const mapExamResults = (results) => {
  if (!results) return null;

  const totalMarks = results.total_marks > 0 ? results.total_marks : 1;
  const score = results.score ?? 0;
  const percentage =
    results.percentage ??
    `${Math.round((parseFloat(score) / totalMarks) * 100)}%`;

  return {
    ...results,
    percentage,
  };
};

export const useExam = (examId) => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const startExam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await startExamApi(examId);
      setExam(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const saveAnswer = useCallback(async (questionId, choiceId) => {
    if (!exam?.attempt_id) {
      console.warn("saveAnswer skipped — attempt_id not available yet");
      return;
    }

    try {
      await saveExamAnswer({
        attempt_id: exam.attempt_id,
        question_id: questionId,
        choice_id: choiceId,
      });
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
    }
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
        is_passed: review.status === "passed",
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
      console.error("Submit failed:", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { exam, loading, error, startExam, saveAnswer, submitExam, submitting, recoverClosedAttempt };
};
