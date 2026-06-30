import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  toastSuccess,
  toastError,
} from "../../../components/shared/Toaster/toaster";
import {
  getLearningGroupsSelection,
  getLearningGroupSessions,
  getSessionAttendance,
  getGroupAttendanceSummary,
  getStudentCourseAttendance,
  exportSessionAttendance,
  exportStudentCourseAttendance,
} from "../services/learningGroupServices";

export const useAdminAttendance = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [selectionGroups, setSelectionGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionAttendance, setSessionAttendance] = useState(null);
  const [groupSummary, setGroupSummary] = useState(null);
  const [studentCourseAttendance, setStudentCourseAttendance] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const sessionsRequestRef = useRef(0);
  const attendanceRequestRef = useRef(0);

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

  const loadSessions = useCallback(
    async (groupId) => {
      if (!groupId) {
        setSessions([]);
        setSessionAttendance(null);
        setLoadingSessions(false);
        return [];
      }

      const requestId = ++sessionsRequestRef.current;

      setLoadingSessions(true);
      setSessions([]);
      setSessionAttendance(null);
      setError(null);

      try {
        const res = await getLearningGroupSessions(groupId);
        const data = res?.data || [];

        if (requestId !== sessionsRequestRef.current) {
          return data;
        }

        setSessions(data);
        return data;
      } catch (err) {
        if (requestId !== sessionsRequestRef.current) {
          return [];
        }

        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed");
        setError(errorMsg);
        toastError(errorMsg);
        setSessions([]);
        return [];
      } finally {
        if (requestId === sessionsRequestRef.current) {
          setLoadingSessions(false);
        }
      }
    },
    [t]
  );

  const loadSessionAttendance = useCallback(
    async (groupId, sessionId) => {
      if (!groupId || !sessionId) {
        setSessionAttendance(null);
        return null;
      }

      const requestId = ++attendanceRequestRef.current;

      setLoadingAttendance(true);
      setError(null);

      try {
        const res = await getSessionAttendance(groupId, sessionId);
        const data = res?.data || null;

        if (requestId !== attendanceRequestRef.current) {
          return data;
        }

        setSessionAttendance(data);
        return data;
      } catch (err) {
        if (requestId !== attendanceRequestRef.current) {
          return null;
        }

        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed");
        setError(errorMsg);
        toastError(errorMsg);
        setSessionAttendance(null);
        return null;
      } finally {
        if (requestId === attendanceRequestRef.current) {
          setLoadingAttendance(false);
        }
      }
    },
    [t]
  );

  const loadStudentCourseAttendance = useCallback(
    async (groupId, studentId) => {
      if (!groupId || !studentId) {
        setStudentCourseAttendance(null);
        return null;
      }

      setLoadingSummary(true);
      setError(null);
      try {
        const res = await getStudentCourseAttendance(groupId, studentId);
        const data = res?.data || null;
        setStudentCourseAttendance(data);
        return data;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed");
        setError(errorMsg);
        toastError(errorMsg);
        setStudentCourseAttendance(null);
        return null;
      } finally {
        setLoadingSummary(false);
      }
    },
    [t]
  );

  const loadGroupSummary = useCallback(
    async (groupId) => {
      if (!groupId) {
        setGroupSummary(null);
        return null;
      }

      setLoadingSummary(true);
      setError(null);
      try {
        const res = await getGroupAttendanceSummary(groupId);
        const data = res?.data || null;
        setGroupSummary(data);
        return data;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed");
        setError(errorMsg);
        toastError(errorMsg);
        setGroupSummary(null);
        return null;
      } finally {
        setLoadingSummary(false);
      }
    },
    [t]
  );

  const handleExportSession = useCallback(
    async (groupId, sessionId, format) => {
      if (!groupId || !sessionId) return;

      setExportLoading(true);
      try {
        await exportSessionAttendance(groupId, sessionId, format);
        toastSuccess(t("adminDashboard:studentAttendance.exportSuccess"));
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:studentAttendance.exportFailed");
        toastError(errorMsg);
      } finally {
        setExportLoading(false);
      }
    },
    [t]
  );

  const handleExportStudent = useCallback(
    async (groupId, studentId, format) => {
      if (!groupId || !studentId) return;

      setExportLoading(true);
      try {
        await exportStudentCourseAttendance(groupId, studentId, format);
        toastSuccess(t("adminDashboard:studentAttendance.exportSuccess"));
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:studentAttendance.exportFailed");
        toastError(errorMsg);
      } finally {
        setExportLoading(false);
      }
    },
    [t]
  );

  const resetSessionData = useCallback(() => {
    sessionsRequestRef.current += 1;
    attendanceRequestRef.current += 1;
    setSessions([]);
    setSessionAttendance(null);
    setLoadingSessions(false);
    setLoadingAttendance(false);
  }, []);

  return {
    selectionGroups,
    sessions,
    sessionAttendance,
    groupSummary,
    studentCourseAttendance,
    loadingGroups,
    loadingSessions,
    loadingAttendance,
    loadingSummary,
    exportLoading,
    error,
    loadGroups,
    loadSessions,
    loadSessionAttendance,
    loadGroupSummary,
    loadStudentCourseAttendance,
    handleExportSession,
    handleExportStudent,
    resetSessionData,
  };
};
