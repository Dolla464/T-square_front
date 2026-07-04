import { useState, useCallback, useEffect, useRef } from "react";
import { toastError, toastSuccess } from "../../../components/shared/Toaster/toaster";
import {
  getTodaySchedule,
  getSessionDetails,
  markAttendance as apiMarkAttendance,
  getSessionQr,
} from "../services/receptionistAttendanceService";

const AUTO_REFRESH_INTERVAL_MS = 30_000;

export const useReceptionistAttendance = (recentScansLimit = 10) => {
  const [todaySessions, setTodaySessions]   = useState([]);
  const [activeSession, setActiveSession]   = useState(null);
  const [students, setStudents]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [qrCode, setQrCode]                 = useState(null);
  const [qrLoading, setQrLoading]           = useState(false);
  const [recentScans, setRecentScans]       = useState([]);

  const intervalRef = useRef(null);

  const loadTodaySchedule = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res      = await getTodaySchedule();
      const sessions = Array.isArray(res?.data) ? res.data : [];
      setTodaySessions(sessions);

      const active =
        sessions.find((s) => s.status === "active") || sessions[0] || null;
      if (active) {
        setActiveSession((prev) => {
          if (prev?.session_id === active.session_id) return prev;
          return active;
        });
        if (!silent) {
          await loadSessionDetails(active.session_id);
        }
      } else {
        if (!silent) {
          setActiveSession(null);
          setStudents([]);
        }
      }
    } catch (err) {
      if (!silent) {
        const msg = err?.response?.data?.message || "Failed to load today's schedule.";
        toastError(msg);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSessionDetails = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setDetailLoading(true);
    try {
      const res  = await getSessionDetails(sessionId);
      const data = res?.data;
      if (data) {
        setActiveSession(data);
        setStudents(Array.isArray(data.students) ? data.students : []);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load session details.";
      toastError(msg);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const markAttendance = useCallback(
    async (studentId, status) => {
      setStudents((prev) =>
        prev.map((s) =>
          s.student_id === studentId
            ? { ...s, status, marked_at: new Date().toISOString(), marked_by: "receptionist_manual" }
            : s
        )
      );

      try {
        await apiMarkAttendance(activeSession?.session_id, studentId, status);
        toastSuccess("Attendance updated.");

        setRecentScans((prev) => {
          const student  = students.find((s) => s.student_id === studentId);
          const newRecord = {
            record_id:    `manual-${Date.now()}`,
            student_id:   studentId,
            student_name: student?.full_name || "Unknown",
            session_id:   activeSession?.session_id,
            status,
            marked_at:    new Date().toISOString(),
            marked_by:    "receptionist_manual",
          };
          const filtered = prev.filter((s) => s.student_id !== studentId);
          return [newRecord, ...filtered].slice(0, recentScansLimit);
        });

        setTodaySessions((prev) =>
          prev.map((sess) => {
            if (sess.session_id !== activeSession?.session_id) return sess;
            const presentDelta = ["present", "late"].includes(status) ? 1 : -1;
            return {
              ...sess,
              attendance: {
                ...sess.attendance,
                present: Math.max(0, (sess.attendance?.present ?? 0) + presentDelta),
              },
            };
          })
        );
      } catch {
        setStudents((prev) =>
          prev.map((s) =>
            s.student_id === studentId
              ? { ...s, status: s._prevStatus ?? "not_marked" }
              : s
          )
        );
        toastError("Failed to mark attendance.");
      }
    },
    [activeSession, students, recentScansLimit]
  );

  const markAllPresent = useCallback(async () => {
    if (!activeSession?.session_id) return;
    const unmarked = students.filter(
      (s) => s.status === "not_marked" || s.status === "absent"
    );
    for (const student of unmarked) {
      await markAttendance(student.student_id, "present");
    }
  }, [students, activeSession, markAttendance]);

  const loadQrCode = useCallback(async (sessionId) => {
    setQrLoading(true);
    setQrCode(null);
    try {
      const res = await getSessionQr(sessionId);
      setQrCode(res?.data?.qr_code ?? null);
    } catch (err) {
      const msg = err?.response?.data?.message || "QR code not available for this session.";
      toastError(msg);
    } finally {
      setQrLoading(false);
    }
  }, []);

  const selectSession = useCallback(
    async (session) => {
      setActiveSession(session);
      setStudents([]);
      setQrCode(null);
      await loadSessionDetails(session.session_id);
    },
    [loadSessionDetails]
  );

  useEffect(() => {
    loadTodaySchedule();

    intervalRef.current = setInterval(() => {
      loadTodaySchedule({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadTodaySchedule]);

  return {
    todaySessions,
    activeSession,
    students,
    loading,
    detailLoading,
    qrCode,
    qrLoading,
    recentScans,
    setRecentScans,
    loadTodaySchedule,
    loadSessionDetails,
    markAttendance,
    markAllPresent,
    loadQrCode,
    selectSession,
  };
};
