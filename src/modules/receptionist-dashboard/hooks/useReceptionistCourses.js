import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastError } from "../../../components/shared/Toaster/toaster";
import {
  getCourses as fetchCourses,
  getCourseById as fetchCourseById,
} from "../services/receptionistCoursesService";

export const useReceptionistCourses = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCourses = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCourses(params);
      const data = response?.data || [];
      const meta = response?.meta || null;
      setCourses(Array.isArray(data) ? data : []);
      setPagination(meta);
      return { data, meta };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const getCourseById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCourseById(id);
      const data = response?.data || response;
      setCourse(data);
      return data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  return {
    courses,
    course,
    pagination,
    loading,
    error,
    getCourses,
    getCourseById,
  };
};
