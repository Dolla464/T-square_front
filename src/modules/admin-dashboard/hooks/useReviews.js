import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";
import {
  getReviews as fetchReviews,
  getReviewById as fetchReviewById,
  deleteReview as apiDeleteReview,
} from "../services/reviewsService";

export const useReviews = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getReviews = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchReviews(params);
      const data = response?.data || [];
      const paginationData = response?.pagination || null;
      setReviews(Array.isArray(data) ? data : []);
      setPagination(paginationData);
      return { data, pagination: paginationData };
    } catch (err) {
      console.error("Error fetching reviews:", err);
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const getReviewById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchReviewById(id);
      const data = response?.data || response;
      setReview(data);
      return data;
    } catch (err) {
      console.error("Error fetching review:", err);
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const deleteReview = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteReview(id);
      toastSuccess(t("adminDashboard:success.deleted", "Deleted successfully"));
      return true;
    } catch (err) {
      console.error("Error deleting review:", err);
      const errorMsg = err.response?.data?.message || t("adminDashboard:errors.delete_failed", "Failed to delete");
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    reviews,
    review,
    pagination,
    loading,
    error,
    getReviews,
    getReviewById,
    deleteReview,
  };
};
