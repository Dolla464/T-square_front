import { useState } from "react";
import { startExam as startExamApi, saveExamAnswer, submitExam as submitExamApi } from "../services/dashboardService";

export const useExam = (examId) => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const startExam = async () => {
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
  };

  const saveAnswer = async (questionId, choiceId) => {
    // Guard: must have a valid attempt_id before saving
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
    }
  };

  const submitExam = async (attemptId) => {
    // CRITICAL: submit uses attempt_id, NOT examId
    // The backend route is /exams/{attempt_id}/submit
    if (!attemptId) {
      throw new Error("Cannot submit: attempt_id is missing");
    }
    try {
      setSubmitting(true);
      const res = await submitExamApi(attemptId);
      return res.data;
    } catch (err) {
      console.error("Submit failed:", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { exam, loading, error, startExam, saveAnswer, submitExam, submitting };
};
