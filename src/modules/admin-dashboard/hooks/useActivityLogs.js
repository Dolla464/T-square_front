import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastError } from "../../../components/shared/Toaster/toaster";
import {
  clearStoredActivityLogToken,
  getActivityLogs,
} from "../services/activityLogService";

export const useActivityLogs = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getActivityLogs(params);
        const data = response?.data || [];
        const paginationData = response?.pagination
          ? {
              current_page: response.pagination.current_page,
              total_pages: response.pagination.total_pages,
              total: response.pagination.total,
            }
          : null;

        setLogs(Array.isArray(data) ? data : []);
        setPagination(paginationData);

        return { data, pagination: paginationData };
      } catch (err) {
        const status = err.response?.status;
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:history.errors.fetch_failed", "Failed to fetch activity logs");

        if (status === 401 || status === 403) {
          clearStoredActivityLogToken();
        }

        setError(errorMsg);
        toastError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  return {
    logs,
    pagination,
    loading,
    error,
    fetchLogs,
  };
};
