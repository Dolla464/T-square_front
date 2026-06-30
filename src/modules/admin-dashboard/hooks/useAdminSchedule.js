import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getScheduleSessions,
  rescheduleSession as apiReschedule,
  cancelSession as apiCancel,
  exportSchedule as apiExport,
  getInstructorsSelection,
} from "../services/adminScheduleService";

const today = () => new Date().toISOString().split("T")[0];

const formatLocalDate = (dt) => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Week runs Sat → Fri (Egypt convention). */
export const getWeekBounds = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const satOffset = day === 6 ? 0 : -(day + 1);
  const sat = new Date(d);
  sat.setDate(d.getDate() + satOffset);
  const fri = new Date(sat);
  fri.setDate(sat.getDate() + 6);
  return { from: formatLocalDate(sat), to: formatLocalDate(fri) };
};

const buildApiParams = (filters, viewMode) => {
  const params = { ...filters };

  if (viewMode === "week") {
    delete params.date;
  } else {
    delete params.date_from;
    delete params.date_to;
  }

  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined
    )
  );
};

export const useAdminSchedule = () => {
  // ── Data state ────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── View mode ─────────────────────────────────────────────────────────────
  const [viewMode, setViewModeState] = useState("day");

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    date: today(),
    date_from: "",
    date_to: "",
    instructor_id: "",
    status: "",
    group_id: "",
    per_page: 15,
    page: 1,
  });

  // ── Instructor list for dropdown ──────────────────────────────────────────
  const [instructors, setInstructors] = useState([]);
  const [instructorsLoading, setInstructorsLoading] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [rescheduleModal, setRescheduleModal] = useState({ show: false, session: null });
  const [cancelModal, setCancelModal] = useState({ show: false, session: null });

  // ── Action loading ────────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch sessions ────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async (overrideFilters = null, mode = viewMode) => {
    setLoading(true);
    setError(null);
    try {
      const params = overrideFilters ?? filters;
      const cleanParams = buildApiParams(params, mode);
      const res = await getScheduleSessions(cleanParams);
      setSessions(Array.isArray(res?.data) ? res.data : []);
      setPagination(res?.pagination ?? null);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load schedule.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filters, viewMode]);

  // ── Initial load + re-fetch when filters change ───────────────────────────
  useEffect(() => {
    fetchSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ── Load instructors once ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setInstructorsLoading(true);
      try {
        const res = await getInstructorsSelection();
        const list = Array.isArray(res?.data) ? res.data : [];
        setInstructors(list);
      } catch {
        // Non-critical
      } finally {
        setInstructorsLoading(false);
      }
    };
    load();
  }, []);

  // ── Filter helpers ────────────────────────────────────────────────────────
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleDateChange = useCallback((dateStr) => {
    setFilters((prev) => {
      if (viewMode === "week") {
        const { from, to } = getWeekBounds(dateStr);
        return { ...prev, date: dateStr, date_from: from, date_to: to, page: 1 };
      }
      return { ...prev, date: dateStr, date_from: "", date_to: "", page: 1 };
    });
  }, [viewMode]);

  const setViewMode = useCallback((mode) => {
    setViewModeState(mode);
    setFilters((prev) => {
      const refDate = prev.date || today();
      if (mode === "week") {
        const { from, to } = getWeekBounds(refDate);
        return { ...prev, date: refDate, date_from: from, date_to: to, page: 1 };
      }
      return { ...prev, date: refDate, date_from: "", date_to: "", page: 1 };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setViewModeState("day");
    setFilters({
      date: today(),
      date_from: "",
      date_to: "",
      instructor_id: "",
      status: "",
      group_id: "",
      per_page: 15,
      page: 1,
    });
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  // ── Reschedule ────────────────────────────────────────────────────────────
  const openRescheduleModal = useCallback((session) => {
    setRescheduleModal({ show: true, session });
  }, []);

  const closeRescheduleModal = useCallback(() => {
    setRescheduleModal({ show: false, session: null });
  }, []);

  const handleReschedule = useCallback(async (sessionId, data) => {
    setActionLoading(true);
    try {
      await apiReschedule(sessionId, data);
      toast.success("Session rescheduled successfully. Notifications sent.");
      closeRescheduleModal();
      fetchSessions();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to reschedule session.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }, [closeRescheduleModal, fetchSessions]);

  // ── Cancel ────────────────────────────────────────────────────────────────
  const openCancelModal = useCallback((session) => {
    setCancelModal({ show: true, session });
  }, []);

  const closeCancelModal = useCallback(() => {
    setCancelModal({ show: false, session: null });
  }, []);

  const handleCancel = useCallback(async (sessionId, reason) => {
    setActionLoading(true);
    try {
      await apiCancel(sessionId, reason);
      toast.success("Session cancelled. Notifications sent.");
      closeCancelModal();
      fetchSessions();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to cancel session.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }, [closeCancelModal, fetchSessions]);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async (format) => {
    const exportFilters = buildApiParams(
      Object.fromEntries(
        Object.entries(filters).filter(([k]) => !["per_page", "page"].includes(k))
      ),
      viewMode
    );
    try {
      await apiExport(exportFilters, format);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  }, [filters, viewMode]);

  const weekBounds =
    viewMode === "week" && filters.date_from && filters.date_to
      ? { from: filters.date_from, to: filters.date_to }
      : getWeekBounds(filters.date || today());

  return {
    sessions,
    pagination,
    loading,
    error,
    instructors,
    instructorsLoading,
    filters,
    viewMode,
    weekBounds,
    updateFilter,
    handleDateChange,
    setViewMode,
    resetFilters,
    handlePageChange,
    rescheduleModal,
    openRescheduleModal,
    closeRescheduleModal,
    cancelModal,
    openCancelModal,
    closeCancelModal,
    handleReschedule,
    handleCancel,
    handleExport,
    actionLoading,
    refetch: fetchSessions,
  };
};
