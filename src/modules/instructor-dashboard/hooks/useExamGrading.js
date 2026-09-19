import { useCallback, useState } from "react";
import {
  getGradingAttemptDetails,
  getPendingGradingAttempts,
  submitAttemptGrades,
} from "../services/instructorExamGradingService";
import { toastCustom } from "../../../components/shared/Toaster/toaster";
import { getApiErrorMessage } from "../../../utils/apiErrors";

export function useExamGrading() {
  const [pendingAttempts, setPendingAttempts] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingAttempt, setLoadingAttempt] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPendingAttempts = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await getPendingGradingAttempts();
      const items = res.data?.data ?? res.data ?? [];
      setPendingAttempts(Array.isArray(items) ? items : []);
      return items;
    } catch (err) {
      toastCustom({
        message: getApiErrorMessage(err, "Failed to load pending grading attempts"),
        type: "error",
        bsIcon: "bi-x-circle",
      });
      return [];
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadAttemptForGrading = useCallback(async (attemptId) => {
    setLoadingAttempt(true);
    try {
      const res = await getGradingAttemptDetails(attemptId);
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      toastCustom({
        message: getApiErrorMessage(err, "Failed to load attempt details"),
        type: "error",
        bsIcon: "bi-x-circle",
      });
      return null;
    } finally {
      setLoadingAttempt(false);
    }
  }, []);

  const gradeAttempt = useCallback(async (attemptId, answers) => {
    setSubmitting(true);
    try {
      const res = await submitAttemptGrades(attemptId, answers);
      toastCustom({
        message: "Exam attempt graded successfully",
        type: "success",
        bsIcon: "bi-check2-circle",
      });
      return res.data?.data ?? res.data ?? null;
    } catch (err) {
      toastCustom({
        message: getApiErrorMessage(err, "Failed to submit grades"),
        type: "error",
        bsIcon: "bi-x-circle",
      });
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    pendingAttempts,
    loadingList,
    loadingAttempt,
    submitting,
    loadPendingAttempts,
    loadAttemptForGrading,
    gradeAttempt,
  };
}
