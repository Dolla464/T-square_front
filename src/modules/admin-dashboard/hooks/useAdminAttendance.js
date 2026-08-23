import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  toastSuccess,
  toastError,
} from "../../../components/shared/Toaster/toaster";
import { parseApiDateOnly } from "../../../utils/formatDateTime";
import * as adminAttendanceServices from "../services/learningGroupServices";

const APP_TIMEZONE = "Africa/Cairo";

export const isSessionMarkable = (session) => {
  if (!session) return false;
  if (session.status === "cancelled") return false;
  if (session.status === "completed") return true;

  const dateRaw = session.override_date || session.session_date;
  const effectiveDate = parseApiDateOnly(dateRaw);
  if (!effectiveDate) return false;

  const today = new Date().toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
  return effectiveDate < today;
};

const recalcAttendanceStats = (students) => {
  const present = students.filter((s) => ["present", "late"].includes(s.status)).length;
  return {
    total: students.length,
    present,
    absent: students.length - present,
  };
};

export const createAttendanceHook = (services) => () => {
  const {
    getLearningGroupsSelection,
    getLearningGroupSessions,
    getSessionAttendance,
    getGroupAttendanceSummary,
    getStudentCourseAttendance,
    exportSessionAttendance,
    exportStudentCourseAttendance,
    markSessionAttendance,
  } = services;

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
  const [updatingIds, setUpdatingIds] = useState(() => new Set());
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
  }, [getLearningGroupsSelection, t]);

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
    [getLearningGroupSessions, t]
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
    [getSessionAttendance, t]
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
    [getStudentCourseAttendance, t]
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
    [getGroupAttendanceSummary, t]
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
    [exportSessionAttendance, t]
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
    [exportStudentCourseAttendance, t]
  );

  const resetSessionData = useCallback(() => {
    sessionsRequestRef.current += 1;
    attendanceRequestRef.current += 1;
    setSessions([]);
    setSessionAttendance(null);
    setGroupSummary(null);
    setLoadingSessions(false);
    setLoadingAttendance(false);
    setUpdatingIds(new Set());
  }, []);

  const markAttendance = useCallback(
    async (groupId, sessionId, studentId, status, sessionMeta = null) => {
      if (!groupId || !sessionId) return;
      if (!isSessionMarkable(sessionMeta ?? sessionAttendance)) return;
      if (updatingIds.has(studentId)) return;

      const students = sessionAttendance?.students ?? [];
      const student = students.find((s) => s.student_id === studentId);
      const previousStatus = student ? student.status : "not_marked";

      if (previousStatus === status) return;

      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.add(studentId);
        return next;
      });

      setSessionAttendance((prev) => {
        if (!prev) return prev;

        const updatedStudents = prev.students.map((s) =>
          s.student_id === studentId
            ? {
                ...s,
                status,
                marked_at: new Date().toISOString(),
                marked_by: "admin_manual",
              }
            : s
        );

        return {
          ...prev,
          students: updatedStudents,
          attendance: recalcAttendanceStats(updatedStudents),
        };
      });

      try {
        await markSessionAttendance(groupId, sessionId, studentId, status);
        toastSuccess(t("adminDashboard:studentAttendance.attendanceUpdated"));
        loadGroupSummary(groupId);
      } catch (err) {
        setSessionAttendance((prev) => {
          if (!prev) return prev;

          const rolledBackStudents = prev.students.map((s) =>
            s.student_id === studentId ? { ...s, status: previousStatus } : s
          );

          return {
            ...prev,
            students: rolledBackStudents,
            attendance: recalcAttendanceStats(rolledBackStudents),
          };
        });

        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:studentAttendance.attendanceUpdateFailed");
        toastError(errorMsg);
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(studentId);
          return next;
        });
      }
    },
    [markSessionAttendance, sessionAttendance, loadGroupSummary, t, updatingIds]
  );

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
    updatingIds,
    error,
    loadGroups,
    loadSessions,
    loadSessionAttendance,
    loadGroupSummary,
    loadStudentCourseAttendance,
    handleExportSession,
    handleExportStudent,
    markAttendance,
    resetSessionData,
  };
};

export const useAdminAttendance = createAttendanceHook({
  getLearningGroupsSelection: adminAttendanceServices.getLearningGroupsSelection,
  getLearningGroupSessions: adminAttendanceServices.getLearningGroupSessions,
  getSessionAttendance: adminAttendanceServices.getSessionAttendance,
  getGroupAttendanceSummary: adminAttendanceServices.getGroupAttendanceSummary,
  getStudentCourseAttendance: adminAttendanceServices.getStudentCourseAttendance,
  exportSessionAttendance: adminAttendanceServices.exportSessionAttendance,
  exportStudentCourseAttendance: adminAttendanceServices.exportStudentCourseAttendance,
  markSessionAttendance: adminAttendanceServices.markSessionAttendance,
});
