import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";
import {
  getCourses as fetchCourses,
  getCourseById as fetchCourseById,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse,
  deleteCourse as apiDeleteCourse,
  getTrashedCourses as fetchTrashedCourses,
  restoreCourse as apiRestoreCourse,
  forceDeleteCourse as apiForceDeleteCourse,
} from "../services/coursesServices";

export const useAdminCourses = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [pagination, setPagination] = useState(null); // API meta
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCourses = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCourses(params);
      // API returns: { data: [...], meta: { current_page, last_page, total, ... } }
      const data = response?.data || [];
      const meta = response?.meta || null;
      setCourses(Array.isArray(data) ? data : []);
      setPagination(meta);
      return { data, meta };
    } catch (err) {
      console.error("Error fetching courses:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
      setError(errorMsg);
      toastError(errorMsg);
      console.log(err.response);

    } finally {
      setLoading(false);
    }
  }, [t]);

  const getCourseById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCourseById(id);
      // API returns: { data: {...} }
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
      console.log(err.response);

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
      console.log(err.response);

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

  const getTrashedCourses = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTrashedCourses(params);
      const data = response?.data || [];
      const meta = response?.meta || null;
      setCourses(Array.isArray(data) ? data : []);
      setPagination(meta);
      return { data, meta };
    } catch (err) {
      console.error("Error fetching trashed courses:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const restoreCourse = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiRestoreCourse(id);
      // eslint-disable-next-line
      toastSuccess(t("adminDashboard:success.restored", "Restored successfully"));
      return true;
    } catch (err) {
      console.error("Error restoring course:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.restore_failed", "Failed to restore");
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const forceDeleteCourse = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiForceDeleteCourse(id);
      // eslint-disable-next-line
      toastSuccess(t("adminDashboard:success.force_deleted", "Permanently deleted"));
      return true;
    } catch (err) {
      console.error("Error force deleting course:", err);
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
    pagination, // { current_page, last_page, total, per_page, ... }
    loading,
    error,
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getTrashedCourses,
    restoreCourse,
    forceDeleteCourse,
  };
};