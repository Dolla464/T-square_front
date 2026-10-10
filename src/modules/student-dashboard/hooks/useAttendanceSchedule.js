import { useState, useCallback, useEffect } from "react";
import { toastError } from "../../../components/shared/Toaster/toaster";
import { getAttendanceSchedule } from "../services/studentAttendanceService";

export function useAttendanceSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const from = new Date().toISOString().slice(0, 10);
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 30);
      const to = toDate.toISOString().slice(0, 10);

      const res = await getAttendanceSchedule({ from, to });
      setSchedule(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      toastError(err?.response?.data?.message || "Failed to load schedule.");
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  return {
    schedule,
    loading,
    loadSchedule,
  };
}
