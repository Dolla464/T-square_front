import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastError } from "../../../components/shared/Toaster/toaster";
import {
  getInstructors as fetchInstructors,
  getInstructorById as fetchInstructorById,
} from "../services/receptionistInstructorsService";

export const useReceptionistInstructors = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [instructors, setInstructors] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getInstructors = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInstructors(params);
      const data = res?.data;
      const paginationData = res?.pagination;

      setInstructors(Array.isArray(data) ? data : []);
      setPagination(paginationData || null);
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

  const getInstructorById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInstructorById(id);
      const data = res?.data || res;
      setInstructor(data);
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
    instructors,
    instructor,
    pagination,
    loading,
    error,
    getInstructors,
    getInstructorById,
  };
};
