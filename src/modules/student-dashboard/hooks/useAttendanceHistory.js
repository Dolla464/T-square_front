import { useState, useCallback, useEffect } from "react";
import { toastError } from "../../../components/shared/Toaster/toaster";
import {
  getAttendanceSummary,
  getGroupAttendanceHistory,
} from "../services/studentAttendanceService";

export function useAttendanceHistory() {
  const [summary, setSummary] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupHistory, setGroupHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAttendanceSummary();
      const groups = Array.isArray(res?.data) ? res.data : [];
      setSummary(groups);
      return groups;
    } catch (err) {
      toastError(err?.response?.data?.message || "Failed to load attendance summary.");
      setSummary([]);
      return [];
    } finally {
      setLoading(false);
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

  const selectGroup = useCallback(
    async (groupId) => {
      setSelectedGroupId(Number(groupId));
      await loadGroupHistory(groupId);
    },
    [loadGroupHistory],
  );

  useEffect(() => {
    loadSummary().then((groups) => {
      if (groups.length > 0) {
        setSelectedGroupId(groups[0].group_id);
        loadGroupHistory(groups[0].group_id);
      }
    });
  }, [loadSummary, loadGroupHistory]);

  return {
    summary,
    selectedGroupId,
    groupHistory,
    loading,
    historyLoading,
    loadSummary,
    selectGroup,
  };
}
