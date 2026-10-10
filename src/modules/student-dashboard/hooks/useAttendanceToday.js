import { useState, useCallback, useEffect, useRef } from "react";
import { toastError } from "../../../components/shared/Toaster/toaster";
import {
  getTodayAttendance,
  getAttendanceQr,
  checkInWithSessionQr,
} from "../services/studentAttendanceService";
import { pickDefaultSession } from "../pages/StudentAttendance/utils/attendanceStats";

const QR_POLL_INTERVAL_MS = 12_000;
const TODAY_REFRESH_MS = 30_000;

export function useAttendanceToday() {
  const [todaySessions, setTodaySessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInError, setCheckInError] = useState(null);

  const qrPollRef = useRef(null);
  const todayPollRef = useRef(null);

  const loadToday = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res = await getTodayAttendance();
      const sessions = Array.isArray(res?.data) ? res.data : [];
      setTodaySessions(sessions);

      setActiveSession((prev) => {
        if (prev && sessions.some((session) => session.session_id === prev.session_id)) {
          return sessions.find((session) => session.session_id === prev.session_id);
        }
        return pickDefaultSession(sessions);
      });
    } catch (err) {
      if (!silent) {
        toastError(err?.response?.data?.message || "Failed to load today's sessions.");
      }
    } finally {
      if (!silent) setLoading(false);
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

  const handleCheckIn = useCallback(
    async (code) => {
      setCheckInLoading(true);
      setCheckInError(null);
      setCheckInSuccess(false);
      try {
        const res = await checkInWithSessionQr(code);
        setCheckInSuccess(true);
        await loadToday({ silent: true });
        return res;
      } catch (err) {
        const msg = err?.response?.data?.message || "Check-in failed.";
        setCheckInError(msg);
        toastError(msg);
        throw err;
      } finally {
        setCheckInLoading(false);
      }
    },
    [loadToday],
  );

  useEffect(() => {
    loadToday();
  }, [loadToday]);

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
    todaySessions,
    activeSession,
    qrCode,
    qrExpiresAt,
    loading,
    qrLoading,
    checkInLoading,
    checkInSuccess,
    checkInError,
    loadToday,
    loadQrCode,
    handleCheckIn,
    resetCheckIn,
    selectSession,
  };
}
