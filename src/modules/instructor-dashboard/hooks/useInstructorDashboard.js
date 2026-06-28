import { useState, useEffect, useCallback } from "react";
import axiosClient from "../../../api/axios";
import { toastError } from "../../../components/shared/Toaster/toaster";

// ── Stats (4 overview widgets) ────────────────────────────────────────────────

export function useInstructorStats() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);   // true on first mount
  const [error, setError]     = useState(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    axiosClient
      .get("/instructor/dashboard/stats")
      .then((res) => {
        if (!ignore) setStats(res.data.data);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to load dashboard stats.";
        if (!ignore) { setError(msg); toastError(msg); }
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [trigger]);

  // setLoading(true) happens here (outside the effect) to avoid sync setState in effect
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setTrigger((n) => n + 1);
  }, []);

  return { stats, loading, error, refetch };
}

// ── Active Groups table ───────────────────────────────────────────────────────

export function useInstructorGroups() {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);   // true on first mount
  const [error, setError]     = useState(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    axiosClient
      .get("/instructor/dashboard/active-groups")
      .then((res) => {
        if (!ignore) setGroups(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to load active groups.";
        if (!ignore) { setError(msg); toastError(msg); }
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [trigger]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setTrigger((n) => n + 1);
  }, []);

  return { groups, loading, error, refetch };
}

// ── Completed Groups table (paginated) ───────────────────────────────────────

export function useCompletedGroups(page = 1, perPage = 10) {
  const [groups, setGroups]   = useState([]);
  const [meta, setMeta]       = useState(null);   // { current_page, last_page, per_page, total }
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    axiosClient
      .get("/instructor/dashboard/completed-groups", {
        params: { page, per_page: perPage },
      })
      .then((res) => {
        if (!ignore) {
          const payload = res.data.data;
          setGroups(Array.isArray(payload?.data) ? payload.data : []);
          setMeta(payload?.meta ?? null);
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to load completed groups.";
        if (!ignore) { setError(msg); toastError(msg); }
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [page, perPage, trigger]);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  return { groups, meta, loading, error, refetch };
}

// ── Group details modal ───────────────────────────────────────────────────────

export function useGroupDetails(groupId) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(!!groupId); // true if groupId provided
  const [error, setError]     = useState(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!groupId) return;

    let ignore = false;

    axiosClient
      .get(`/instructor/dashboard/groups/${groupId}`)
      .then((res) => {
        if (!ignore) setDetails(res.data.data);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to load group details.";
        if (!ignore) { setError(msg); toastError(msg); }
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [groupId, trigger]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setTrigger((n) => n + 1);
  }, []);

  return { details, loading, error, refetch };
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export function useInstructorSchedule(date) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading]   = useState(true);   // true on first mount
  const [error, setError]       = useState(null);
  const [trigger, setTrigger]   = useState(0);

  useEffect(() => {
    let ignore = false;
    const params = date ? { date } : {};

    axiosClient
      .get("/instructor/dashboard/schedule", { params })
      .then((res) => {
        if (!ignore) setSchedule(res.data.data);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to load schedule.";
        if (!ignore) { setError(msg); toastError(msg); }
      })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [date, trigger]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setTrigger((n) => n + 1);
  }, []);

  return { schedule, loading, error, refetch };
}
