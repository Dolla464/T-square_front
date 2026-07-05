import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getScheduleSessions,
  exportSchedule as apiExport,
  getInstructorsSelection,
} from "../services/receptionistScheduleService";

const today = () => new Date().toISOString().split("T")[0];

const formatLocalDate = (dt) => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getWeekBounds = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  const satOffset = day === 6 ? 0 : -(day + 1);
  const sat = new Date(d);
  sat.setDate(d.getDate() + satOffset);
  const fri = new Date(sat);
  fri.setDate(sat.getDate() + 6);
  return { from: formatLocalDate(sat), to: formatLocalDate(fri) };
};

export const getMonthBounds = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last  = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { from: formatLocalDate(first), to: formatLocalDate(last) };
};

const buildApiParams = (filters, viewMode) => {
  const params = { ...filters, view_mode: viewMode };

  if (viewMode === "week" || viewMode === "month") {
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

export const useReceptionistSchedule = () => {
  const [sessions, setSessions]               = useState([]);
  const [pagination, setPagination]           = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [viewMode, setViewModeState]          = useState("day");
  const [filters, setFilters]                 = useState({
    date: today(),
    date_from: "",
    date_to: "",
    instructor_id: "",
    status: "",
    group_id: "",
    per_page: 15,
    page: 1,
  });
  const [instructors, setInstructors]         = useState([]);
  const [instructorsLoading, setInstructorsLoading] = useState(false);
  const [actionLoading]                       = useState(false);

  const fetchSessions = useCallback(async (overrideFilters = null, mode = viewMode) => {
    setLoading(true);
    setError(null);
    try {
      const params      = overrideFilters ?? filters;
      const cleanParams = buildApiParams(params, mode);
      const res         = await getScheduleSessions(cleanParams);
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

  useEffect(() => {
    fetchSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const load = async () => {
      setInstructorsLoading(true);
      try {
        const res  = await getInstructorsSelection();
        const list = Array.isArray(res?.data) ? res.data : [];
        setInstructors(list);
      } catch {
        // non-critical
      } finally {
        setInstructorsLoading(false);
      }
    };
    load();
  }, []);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleDateChange = useCallback((dateStr) => {
    setFilters((prev) => {
      if (viewMode === "week") {
        const { from, to } = getWeekBounds(dateStr);
        return { ...prev, date: dateStr, date_from: from, date_to: to, page: 1 };
      }
      if (viewMode === "month") {
        const { from, to } = getMonthBounds(dateStr);
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
      if (mode === "month") {
        const { from, to } = getMonthBounds(refDate);
        return { ...prev, date: refDate, date_from: from, date_to: to, per_page: prev.per_page < 50 ? 50 : prev.per_page, page: 1 };
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

  const monthBounds =
    viewMode === "month" && filters.date_from && filters.date_to
      ? { from: filters.date_from, to: filters.date_to }
      : getMonthBounds(filters.date || today());

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
    monthBounds,
    updateFilter,
    handleDateChange,
    setViewMode,
    resetFilters,
    handlePageChange,
    handleExport,
    actionLoading,
    // No reschedule/cancel — read-only
    rescheduleModal: { show: false, session: null },
    cancelModal: { show: false, session: null },
    openRescheduleModal: () => {},
    closeRescheduleModal: () => {},
    openCancelModal: () => {},
    closeCancelModal: () => {},
    handleReschedule: () => {},
    handleCancel: () => {},
    refetch: fetchSessions,
  };
};
