import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";
import {
  getSolutions as fetchSolutions,
  getSolutionById as fetchSolutionById,
  createSolution as apiCreateSolution,
  updateSolution as apiUpdateSolution,
  deleteSolution as apiDeleteSolution,
} from "../services/solutionsService";

export const useAdminSolutions = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [solutions, setSolutions] = useState([]);
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSolutions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchSolutions(params);
      const data = response?.data?.data || response?.data || response;
      setSolutions(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Error fetching solutions:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const getSolutionById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchSolutionById(id);
      const data = response?.data || response;
      setSolution(data);
      return data;
    } catch (err) {
      console.error("Error fetching solution:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const createSolution = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateSolution(payload);
      // eslint-disable-next-line
      toastSuccess(t("adminDashboard:success.created", "Created successfully"));
      return response;
    } catch (err) {
      console.error("Error creating solution:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.create_failed", "Failed to create");
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSolution = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiUpdateSolution(id, payload);
      // eslint-disable-next-line
      toastSuccess(t("adminDashboard:success.updated", "Updated successfully"));
      return response;
    } catch (err) {
      console.error("Error updating solution:", err);
      // eslint-disable-next-line
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.update_failed", "Failed to update");
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSolution = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteSolution(id);
      // eslint-disable-next-line
      toastSuccess(t("adminDashboard:success.deleted", "Deleted successfully"));
      return true;
    } catch (err) {
      console.error("Error deleting solution:", err);
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
    solutions,
    solution,
    loading,
    error,
    getSolutions,
    getSolutionById,
    createSolution,
    updateSolution,
    deleteSolution,
  };
};
