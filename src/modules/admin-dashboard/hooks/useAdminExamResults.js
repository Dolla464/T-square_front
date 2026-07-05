import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  toastSuccess,
  toastError,
} from "../../../components/shared/Toaster/toaster";
import {
  getLearningGroupsSelection,
  getLearningGroupExams,
  getExamResults,
  getStudentExamResults,
  exportExamResults,
} from "../services/learningGroupServices";

export const useAdminExamResults = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [selectionGroups, setSelectionGroups] = useState([]);
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState(null);
  const [studentExamAttempts, setStudentExamAttempts] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingStudentAttempts, setLoadingStudentAttempts] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const examsRequestRef = useRef(0);
  const resultsRequestRef = useRef(0);

  const loadGroups = useCallback(async () => {
    setLoadingGroups(true);
    setError(null);
    try {
      const res = await getLearningGroupsSelection();
      setSelectionGroups(res?.data || []);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        t("adminDashboard:errors.fetch_failed");
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoadingGroups(false);
    }
  }, [t]);

  const loadExams = useCallback(
    async (groupId) => {
      if (!groupId) {
        setExams([]);
        setExamResults(null);
        setLoadingExams(false);
        return [];
      }

      const requestId = ++examsRequestRef.current;

      setLoadingExams(true);
      setExams([]);
      setExamResults(null);
      setError(null);

      try {
        const res = await getLearningGroupExams(groupId);
        const data = res?.data || [];

        if (requestId !== examsRequestRef.current) {
          return data;
        }

        setExams(data);
        return data;
      } catch (err) {
        if (requestId !== examsRequestRef.current) {
          return [];
        }

        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed");
        setError(errorMsg);
        toastError(errorMsg);
        setExams([]);
        return [];
      } finally {
        if (requestId === examsRequestRef.current) {
          setLoadingExams(false);
        }
      }
    },
    [t]
  );

  const loadExamResults = useCallback(
    async (groupId, examId) => {
      if (!groupId || !examId) {
        setExamResults(null);
        return null;
      }

      const requestId = ++resultsRequestRef.current;

      setLoadingResults(true);
      setError(null);

      try {
        const res = await getExamResults(groupId, examId);
        const data = res?.data || null;

        if (requestId !== resultsRequestRef.current) {
          return data;
        }

        setExamResults(data);
        return data;
      } catch (err) {
        if (requestId !== resultsRequestRef.current) {
          return null;
        }

        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed");
        setError(errorMsg);
        toastError(errorMsg);
        setExamResults(null);
        return null;
      } finally {
        if (requestId === resultsRequestRef.current) {
          setLoadingResults(false);
        }
      }
    },
    [t]
  );

  const loadStudentExamAttempts = useCallback(
    async (groupId, studentId, examId) => {
      if (!groupId || !studentId || !examId) {
        setStudentExamAttempts(null);
        return null;
      }

      setLoadingStudentAttempts(true);
      setError(null);
      try {
        const res = await getStudentExamResults(groupId, studentId, examId);
        const raw = res?.data;
        const data = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : [];
        setStudentExamAttempts(data);
        return data;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed");
        setError(errorMsg);
        toastError(errorMsg);
        setStudentExamAttempts(null);
        return null;
      } finally {
        setLoadingStudentAttempts(false);
      }
    },
    [t]
  );

  const handleExportResults = useCallback(
    async (groupId, examId, format) => {
      if (!groupId || !examId) return;

      setExportLoading(true);
      try {
        await exportExamResults(groupId, examId, format);
        toastSuccess(t("adminDashboard:studentResults.exportSuccess"));
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:studentResults.exportFailed");
        toastError(errorMsg);
      } finally {
        setExportLoading(false);
      }
    },
    [t]
  );

  const resetExamData = useCallback(() => {
    examsRequestRef.current += 1;
    resultsRequestRef.current += 1;
    setExams([]);
    setExamResults(null);
    setLoadingExams(false);
    setLoadingResults(false);
  }, []);

  return {
    selectionGroups,
    exams,
    examResults,
    studentExamAttempts,
    loadingGroups,
    loadingExams,
    loadingResults,
    loadingStudentAttempts,
    exportLoading,
    error,
    loadGroups,
    loadExams,
    loadExamResults,
    loadStudentExamAttempts,
    handleExportResults,
    resetExamData,
  };
};
