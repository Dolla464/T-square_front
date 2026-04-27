import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getTags as fetchTags } from "../services/tagsService";

export const useTags = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTags = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTags(params);
      const data = response?.data?.data || response?.data || response;
      setTags(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Error fetching tags:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch tags");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  return {
    tags,
    loading,
    error,
    getTags,
  };
};
