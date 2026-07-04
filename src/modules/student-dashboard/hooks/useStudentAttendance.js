import { useState, useCallback, useEffect, useRef } from "react";
import { toastError } from "../../../components/shared/Toaster/toaster";
import {
  getAttendanceSummary,
  getTodayAttendance,
  getAttendanceSchedule,
  getGroupAttendanceHistory,
  getAttendanceQr,
  checkInWithSessionQr,
} from "../services/studentAttendanceService";

const QR_POLL_INTERVAL_MS = 12_000;
const TODAY_REFRESH_MS = 30_000;

export const useStudentAttendance = () => {
  const [summary, setSummary] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [groupHistory, setGroupHistory] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInError, setCheckInError] = useState(null);

  const qrPollRef = useRef(null);
  const todayPollRef = useRef(null);

  const loadSummary = useCallback(async () => {
    try {
      const res = await getAttendanceSummary();
      setSummary(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      toastError(err?.response?.data?.message || "Failed to load attendance summary.");
    }
  }, []);

  const loadToday = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res = await getTodayAttendance();
      const sessions = Array.isArray(res?.data) ? res.data : [];
      setTodaySessions(sessions);

      const active =
        sessions.find((s) => s.status === "active") ||
        sessions.find((s) => s.qr_available) ||
        sessions[0] ||
        null;

      setActiveSession((prev) => {
        if (prev && sessions.some((s) => s.session_id === prev.session_id)) {
          return sessions.find((s) => s.session_id === prev.session_id);
        }
        return active;
      });
    } catch (err) {
      if (!silent) {
        toastError(err?.response?.data?.message || "Failed to load today's sessions.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      const from = new Date().toISOString().slice(0, 10);
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 30);
      const to = toDate.toISOString().slice(0, 10);

      const res = await getAttendanceSchedule({ from, to });
      setSchedule(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      toastError(err?.response?.data?.message || "Failed to load schedule.");
    }
  }, []);

  const loadGroupHistory = useCallback(async (groupId) => {
    if (!groupId) return;
    setHistoryLoading(true);
    try {
      const res = await getGroupAttendanceHistory(groupId);
      setGroupHistory(res?.data ?? null);
    } catch (err) {
      toastError(err?.response?.data?.message || "Failed to load attendance history.");
      setGroupHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadQrCode = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setQrLoading(true);
    try {
      const res = await getAttendanceQr(sessionId);
      setQrCode(res?.data?.qr_code ?? null);
      setQrExpiresAt(res?.data?.expires_at ?? null);
    } catch (err) {
      setQrCode(null);
      setQrExpiresAt(null);
      toastError(err?.response?.data?.message || "QR code is not available right now.");
    } finally {
      setQrLoading(false);
    }
  }, []);

  const handleCheckIn = useCallback(
    async (qrCode) => {
      setCheckInLoading(true);
      setCheckInError(null);
      setCheckInSuccess(false);
      try {
        const res = await checkInWithSessionQr(qrCode);
        setCheckInSuccess(true);
        await loadToday({ silent: true });
        return res;
      } catch (err) {
        const msg = err?.response?.data?.message || "Check-in failed.";
        setCheckInError(msg);
        throw err;
      } finally {
        setCheckInLoading(false);
      }
    },
    [loadToday],
  );

  const resetCheckIn = useCallback(() => {
    setCheckInSuccess(false);
    setCheckInError(null);
  }, []);

  const selectSession = useCallback((session) => {
    setActiveSession(session);
    setQrCode(null);
    setQrExpiresAt(null);
    resetCheckIn();
  }, [resetCheckIn]);

  const selectGroup = useCallback(
    async (groupId) => {
      await loadGroupHistory(groupId);
    },
    [loadGroupHistory],
  );

  useEffect(() => {
    loadSummary();
    loadToday();
    loadSchedule();
  }, [loadSummary, loadToday, loadSchedule]);

  useEffect(() => {
    todayPollRef.current = setInterval(() => {
      loadToday({ silent: true });
    }, TODAY_REFRESH_MS);

    return () => {
      if (todayPollRef.current) clearInterval(todayPollRef.current);
    };
  }, [loadToday]);

  useEffect(() => {
    if (qrPollRef.current) clearInterval(qrPollRef.current);

    if (!activeSession?.session_id || !qrCode) return;

    qrPollRef.current = setInterval(() => {
      loadToday({ silent: true });
    }, QR_POLL_INTERVAL_MS);

    return () => {
      if (qrPollRef.current) clearInterval(qrPollRef.current);
    };
  }, [activeSession?.session_id, qrCode, loadToday]);

  useEffect(() => {
    if (
      activeSession?.qr_available &&
      activeSession?.student_status !== "present" &&
      activeSession?.student_status !== "late" &&
      !qrCode &&
      !qrLoading
    ) {
      loadQrCode(activeSession.session_id);
    }
  }, [activeSession, qrCode, qrLoading, loadQrCode]);

  return {
    summary,
    todaySessions,
    schedule,
    groupHistory,
    activeSession,
    qrCode,
    qrExpiresAt,
    loading,
    qrLoading,
    historyLoading,
    checkInLoading,
    checkInSuccess,
    checkInError,
    loadSummary,
    loadToday,
    loadSchedule,
    loadGroupHistory,
    loadQrCode,
    handleCheckIn,
    resetCheckIn,
    selectSession,
    selectGroup,
  };
};
