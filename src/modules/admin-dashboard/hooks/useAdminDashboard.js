import { useState, useEffect, useCallback } from "react";
import { toastError } from "../../../components/shared/Toaster/toaster";
import {
  getDashboardStats,
  getRevenueChart,
  getCourseSales,
  getRecentEnrollments,
  getRecentOrders,
  getTopCourses,
} from "../services/adminDashboardService";

function useFetchData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);

    fetcher()
      .then((res) => {
        if (!ignore) setData(res?.data ?? null);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Failed to load dashboard data.";
        if (!ignore) {
          setError(msg);
          toastError(msg);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, trigger]);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  return { data, loading, error, refetch };
}

export function useAdminDashboardStats() {
  return useFetchData(() => getDashboardStats());
}

export function useAdminRevenueChart(period = "month") {
  return useFetchData(() => getRevenueChart(period), [period]);
}

export function useAdminCourseSales(period = "month") {
  return useFetchData(() => getCourseSales(period), [period]);
}

export function useAdminRecentEnrollments() {
  return useFetchData(() => getRecentEnrollments(4));
}

export function useAdminRecentOrders() {
  return useFetchData(() => getRecentOrders(4));
}

export function useAdminTopCourses() {
  return useFetchData(() => getTopCourses(3));
}
