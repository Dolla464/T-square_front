import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  toastSuccess,
  toastError,
} from "../../../components/shared/Toaster/toaster";
import {
  getLearningGroupsSelection,
  getLearningGroupExams,
  toggleGroupExamActivation,
} from "../services/instructorLearningGroupServices";

export const useExamActivation = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [selectionGroups, setSelectionGroups] = useState([]);
  const [exams, setExams] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [togglingExamId, setTogglingExamId] = useState(null);
  const [error, setError] = useState(null);
  const examsRequestRef = useRef(0);

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
        setLoadingExams(false);
        return [];
      }

      const requestId = ++examsRequestRef.current;

      setLoadingExams(true);
      setExams([]);
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

  const handleToggleActivation = useCallback(
    async (groupId, exam) => {
      if (!groupId || !exam?.id) return;

      const nextValue = !exam.is_activated_for_group;

      if (nextValue && !exam.is_active) {
        toastError(t("adminDashboard:examActivation.enableGlobalFirst"));
        return;
      }

      setTogglingExamId(exam.id);
      try {
        await toggleGroupExamActivation(groupId, exam.id, nextValue);
        setExams((prev) =>
          prev.map((item) =>
            item.id === exam.id
              ? { ...item, is_activated_for_group: nextValue }
              : item
          )
        );
        toastSuccess(
          nextValue
            ? t("adminDashboard:examActivation.activatedSuccess")
            : t("adminDashboard:examActivation.deactivatedSuccess")
        );
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:examActivation.toggleFailed");
        toastError(errorMsg);
      } finally {
        setTogglingExamId(null);
      }
    },
    [t]
  );

  const resetExamData = useCallback(() => {
    examsRequestRef.current += 1;
    setExams([]);
    setLoadingExams(false);
  }, []);

  return {
    selectionGroups,
    exams,
    loadingGroups,
    loadingExams,
    togglingExamId,
    error,
    loadGroups,
    loadExams,
    handleToggleActivation,
    resetExamData,
  };
};
