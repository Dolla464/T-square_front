import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toastError, toastSuccess } from "../../../components/shared/Toaster/toaster";
import {
  getTodaySchedule,
  getSessionDetails,
  markAttendance as apiMarkAttendance,
  getSessionQr,
  getSessionRecords,
} from "../services/receptionistAttendanceService";

export const useReceptionistAttendance = (recentScansLimit = 10) => {
  const { i18n } = useTranslation("adminDashboard");
  const [todaySessions, setTodaySessions]   = useState([]);
  const [activeSession, setActiveSession]   = useState(null);
  const [students, setStudents]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [qrCode, setQrCode]                 = useState(null);
  const [qrLoading, setQrLoading]           = useState(false);
  const [recentScans, setRecentScans]       = useState([]);
  const [updatingIds, setUpdatingIds]       = useState(new Set());



  // ── Helper to update active/today session attendance statistics ────────────
  const updateSessionAttendanceStats = useCallback((updatedStudents, sessId) => {
    const present = updatedStudents.filter((s) => ["present", "late"].includes(s.status)).length;
    const absent = updatedStudents.filter((s) => s.status === "absent").length;
    const total = updatedStudents.length;

    setActiveSession((prev) => {
      if (prev && prev.session_id === sessId) {
        return {
          ...prev,
          attendance: { ...prev.attendance, present, absent, total },
        };
      }
      return prev;
    });

    setTodaySessions((prev) =>
      prev.map((sess) => {
        if (sess.session_id === sessId) {
          return {
            ...sess,
            attendance: { ...sess.attendance, present, absent, total },
          };
        }
        return sess;
      })
    );
  }, []);

  // ── Load session details + students ──────────────────────────────────────

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

      try {
        const recordsRes = await getSessionRecords(sessionId);
        const records = Array.isArray(recordsRes?.data) ? recordsRes.data : [];
        const qrScans = records.filter((r) => r.marked_by && !r.marked_by.includes("manual"));
        setRecentScans(qrScans.slice(0, recentScansLimit));
      } catch (err) {
        console.error("Failed to load initial recent scans:", err);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load session details.";
      toastError(msg);
    } finally {
      setDetailLoading(false);
    }
  }, [recentScansLimit]);

  // ── Load today's schedule ─────────────────────────────────────────────────

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
  }, [loadSessionDetails]);

  const applyScannedRecord = useCallback((record) => {
    if (!record?.student_id) return;

    setStudents((prev) => {
      const student = prev.find((s) => s.student_id === record.student_id);
      if (!student) return prev;

      // Skip updating stats and state if the student is already marked with this status
      if (student.status === record.status) return prev;

      const updated = prev.map((s) =>
        s.student_id === record.student_id
          ? {
              ...s,
              status: record.status,
              marked_at: record.marked_at,
              marked_by: record.marked_by,
            }
          : s,
      );

      updateSessionAttendanceStats(updated, record.session_id);
      return updated;
    });
  }, [updateSessionAttendanceStats]);

  const markAttendance = useCallback(
    async (studentId, status) => {
      if (activeSession?.status !== "active") return;
      if (updatingIds.has(studentId)) return;

      const student = students.find((s) => s.student_id === studentId);
      const previousStatus = student ? student.status : "not_marked";

      // Prevent duplicate manual marking of the exact same status
      if (previousStatus === status) return;

      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.add(studentId);
        return next;
      });

      // Optimistic update for students table
      setStudents((prev) => {
        const updated = prev.map((s) =>
          s.student_id === studentId
            ? {
                ...s,
                status,
                marked_at: new Date().toISOString(),
                marked_by: "receptionist_manual",
              }
            : s,
        );
        updateSessionAttendanceStats(updated, activeSession?.session_id);
        return updated;
      });

      try {
        await apiMarkAttendance(activeSession?.session_id, studentId, status);
        toastSuccess(
          i18n.language?.startsWith("ar")
            ? "تم تحديث حالة الحضور بنجاح"
            : "Attendance updated."
        );

        // Update recentScans list
        setRecentScans((prev) => {
          const matchedStudent = students.find((s) => s.student_id === studentId);
          const newRecord = {
            record_id: `manual-${Date.now()}`,
            student_id: studentId,
            student_name: matchedStudent?.full_name || "Unknown",
            session_id: activeSession?.session_id,
            status: status,
            marked_at: new Date().toISOString(),
            marked_by: "receptionist_manual",
          };

          const filtered = prev.filter((s) => s.student_id !== studentId);
          return [newRecord, ...filtered].slice(0, recentScansLimit);
        });
      } catch (err) {
        // Rollback on failure
        setStudents((prev) => {
          const updated = prev.map((s) =>
            s.student_id === studentId
              ? { ...s, status: previousStatus }
              : s,
          );
          updateSessionAttendanceStats(updated, activeSession?.session_id);
          return updated;
        });
        const msg =
          err?.response?.data?.message ||
          (i18n.language?.startsWith("ar")
            ? "فشل تحديث حالة الحضور"
            : "Failed to mark attendance.");
        toastError(msg);
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(studentId);
          return next;
        });
      }
    },
    [activeSession, students, updateSessionAttendanceStats, recentScansLimit, updatingIds, i18n.language]
  );

  const markAllPresent = useCallback(async () => {
    if (activeSession?.status !== "active") return;
    if (!activeSession?.session_id) return;
    const unmarked = students.filter(
      (s) => s.status === "not_marked" || s.status === "absent",
    );
    if (unmarked.length === 0) return;

    // Save previous statuses for rollback
    const previousStatuses = unmarked.map((s) => ({
      student_id: s.student_id,
      status: s.status,
    }));

    // Disable loading rows
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      unmarked.forEach((u) => next.add(u.student_id));
      return next;
    });

    // Optimistically update all to 'present'
    setStudents((prev) => {
      const updated = prev.map((s) => {
        const isUnmarked = unmarked.some((u) => u.student_id === s.student_id);
        if (isUnmarked) {
          return {
            ...s,
            status: "present",
            marked_at: new Date().toISOString(),
            marked_by: "receptionist_manual",
          };
        }
        return s;
      });
      updateSessionAttendanceStats(updated, activeSession.session_id);
      return updated;
    });

    try {
      await Promise.all(
        unmarked.map((student) =>
          apiMarkAttendance(activeSession.session_id, student.student_id, "present")
        )
      );
      toastSuccess(
        i18n.language?.startsWith("ar")
          ? "تم تسجيل حضور جميع الطلاب بنجاح"
          : "All students marked as present."
      );
    } catch {
      // Rollback on batch failure
      setStudents((prev) => {
        const updated = prev.map((s) => {
          const orig = previousStatuses.find((p) => p.student_id === s.student_id);
          if (orig) {
            return { ...s, status: orig.status };
          }
          return s;
        });
        updateSessionAttendanceStats(updated, activeSession.session_id);
        return updated;
      });
      toastError(
        i18n.language?.startsWith("ar")
          ? "فشل تسجيل حضور بعض الطلاب"
          : "Failed to mark all students present."
      );
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        unmarked.forEach((u) => next.delete(u.student_id));
        return next;
      });
    }
  }, [students, activeSession, updateSessionAttendanceStats, i18n.language]);

  const loadQrCode = useCallback(async (sessionId) => {
    setQrLoading(true);
    setQrCode(null);
    try {
      const res = await getSessionQr(sessionId);
      setQrCode(res?.data?.qr_code ?? null);
    } catch {
      toastError("QR code not available for this session.");
    } finally {
      setQrLoading(false);
    }
  }, []);

  const selectSession = useCallback(
    async (session) => {
      setActiveSession(session);
      setStudents([]);
      setQrCode(null);
      setRecentScans([]);
      await loadSessionDetails(session.session_id);
    },
    [loadSessionDetails]
  );

  useEffect(() => {
    setTimeout(() => {
      loadTodaySchedule();
    }, 0);
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
    updatingIds,
    setRecentScans,
    loadTodaySchedule,
    loadSessionDetails,
    markAttendance,
    markAllPresent,
    loadQrCode,
    selectSession,
    applyScannedRecord,
  };
};
