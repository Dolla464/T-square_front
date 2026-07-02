import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastError } from "../../../components/shared/Toaster/toaster";
import { getCourses as fetchCourses } from "../services/instructorCoursesServices";

export const useInstructorCourses = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCourses = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCourses(params);
      const data = response?.data || [];
      setCourses(Array.isArray(data) ? data : []);
      return { data };
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
    loading,
    error,
    getCourses,
  };
};
