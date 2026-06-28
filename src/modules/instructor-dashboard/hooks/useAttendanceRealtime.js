import { useState, useRef, useEffect, useCallback } from "react";
import { getSessionRecords } from "../services/instructorAttendanceServices";

const POLLING_INTERVAL_MS = 5_000;

/**
 * Polls the server every 5 seconds for new attendance records in a session.
 *
 * @param {number|null} sessionId      - The session to poll. Polling stops when null.
 * @param {Function}    onStudentScanned - Called for each new record: (record) => void
 * @returns {{ isPolling: boolean }}
 */
export const useAttendanceRealtime = (sessionId, onStudentScanned) => {
  const [isPolling, setIsPolling]   = useState(false);

  const intervalRef    = useRef(null);
  const isFetchingRef  = useRef(false);
  const lastCheckRef   = useRef(Date.now());
  const callbackRef    = useRef(onStudentScanned);

  // Keep callback ref fresh without restarting the interval
  useEffect(() => {
    callbackRef.current = onStudentScanned;
  }, [onStudentScanned]);

  const poll = useCallback(async () => {
    if (!sessionId || isFetchingRef.current) return;

    isFetchingRef.current = true;
    const since = lastCheckRef.current;

    try {
      const res     = await getSessionRecords(sessionId, since);
      const records = Array.isArray(res?.data) ? res.data : [];

      // Update timestamp before invoking callbacks so a slow callback
      // doesn't cause the same record to be reported twice
      lastCheckRef.current = Date.now();

      records.forEach((record) => {
        if (typeof callbackRef.current === "function") {
          callbackRef.current(record);
        }
      });
    } catch (err) {
      console.error("[useAttendanceRealtime] polling error:", err);
      // Do NOT stop polling on error — keep retrying
    } finally {
      isFetchingRef.current = false;
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setIsPolling(false);
      return;
    }

    // Reset timestamp when we start polling a (possibly new) session
    lastCheckRef.current = Date.now();
    isFetchingRef.current = false;
    setIsPolling(true);

    intervalRef.current = setInterval(poll, POLLING_INTERVAL_MS);

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
