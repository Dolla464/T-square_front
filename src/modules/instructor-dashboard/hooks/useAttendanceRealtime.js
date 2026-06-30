import { useState, useRef, useEffect, useCallback } from "react";
import { getSessionRecords } from "../services/instructorAttendanceServices";

const BASE_INTERVAL_MS = 10_000; // 5 ثواني (الأساس)
const MAX_INTERVAL_MS = 30_000; // 30 ثانية (الحد الأقصى)
const BACKOFF_MULTIPLIER = 2; // نضاعف المدة ×2
const CONSECUTIVE_EMPTY_BEFORE_BACKOFF = 2; // نبدأ backoff بعد كام poll فاضي

export const useAttendanceRealtime = (sessionId, onStudentScanned) => {
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastCheckRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const callbackRef = useRef(onStudentScanned);

  // ✅ Exponential backoff state
  const currentIntervalRef = useRef(BASE_INTERVAL_MS);
  const emptyPollsRef = useRef(0);

  useEffect(() => {
    callbackRef.current = onStudentScanned;
  }, [onStudentScanned]);

  const poll = useCallback(async () => {
    if (!sessionId || isFetchingRef.current) return;

    isFetchingRef.current = true;
    const since = lastCheckRef.current;

    try {
      const res = await getSessionRecords(sessionId, since);
      const records = Array.isArray(res?.data) ? res.data : [];

      // ✅ Deduplicate by student_id (not record_id)
      // Keep track of which students we've already emitted
      const newRecords = records.filter((record) => {
        const studentKey = `${record.student_id}-${record.status}`;
        if (seenIdsRef.current.has(studentKey)) return false;
        seenIdsRef.current.add(studentKey);
        return true;
      });

      lastCheckRef.current = new Date().toISOString();

      // ✅ Exponential backoff logic
      if (newRecords.length === 0) {
        emptyPollsRef.current += 1;
        if (emptyPollsRef.current >= CONSECUTIVE_EMPTY_BEFORE_BACKOFF) {
          currentIntervalRef.current = Math.min(
            currentIntervalRef.current * BACKOFF_MULTIPLIER,
            MAX_INTERVAL_MS,
          );
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(poll, currentIntervalRef.current);
          }
        }
      } else {
        emptyPollsRef.current = 0;
        if (currentIntervalRef.current !== BASE_INTERVAL_MS) {
          currentIntervalRef.current = BASE_INTERVAL_MS;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(poll, BASE_INTERVAL_MS);
          }
        }

        newRecords.forEach((record) => {
          if (typeof callbackRef.current === "function") {
            callbackRef.current(record);
          }
        });
      }
    } catch (err) {
      console.error("[useAttendanceRealtime] polling error:", err);
      emptyPollsRef.current += 1;
    } finally {
      isFetchingRef.current = false;
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setIsPolling(false);
      return;
    }

    // Reset everything
    lastCheckRef.current = null;
    seenIdsRef.current.clear();
    isFetchingRef.current = false;
    emptyPollsRef.current = 0;
    currentIntervalRef.current = BASE_INTERVAL_MS;
    setIsPolling(true);

    poll();

    // ✅ نستخدم setInterval بالـ dynamic interval
    intervalRef.current = setInterval(poll, BASE_INTERVAL_MS);

    return () => {
      setIsPolling(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionId, poll]);

  return { isPolling };
};
