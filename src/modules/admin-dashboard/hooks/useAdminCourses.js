import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";
import {
  getCourses as fetchCourses,
  getCourseById as fetchCourseById,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse,
  deleteCourse as apiDeleteCourse,
} from "../services/coursesServices";

export const useAdminCourses = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCourses = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCourses(params);
      const data = response?.data?.data || response?.data || response;
      setCourses(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Error fetching courses:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
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
      console.error("Error fetching course:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const createCourse = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateCourse(payload);
      // eslint-disable-next-line
      toastSuccess(t("adminDashboard:success.created", "Created successfully"));
      return response;
    } catch (err) {
      console.error("Error creating course:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.create_failed", "Failed to create");
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiUpdateCourse(id, payload);
      // eslint-disable-next-line
      toastSuccess(t("adminDashboard:success.updated", "Updated successfully"));
      return response;
    } catch (err) {
      console.error("Error updating course:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.update_failed", "Failed to update");
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteCourse(id);
      // eslint-disable-next-line
      toastSuccess(t("adminDashboard:success.deleted", "Deleted successfully"));
      return true;
    } catch (err) {
      console.error("Error deleting course:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.delete_failed", "Failed to delete");
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    courses,
    course,
    loading,
    error,
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};