import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  toastSuccess,
  toastError,
} from "../../../components/shared/Toaster/toaster";
import {
  getReviews as fetchReviews,
  getReviewById as fetchReviewById,
  deleteReview as apiDeleteReview,
  changeReviewStatus as apiChangeReviewStatus,
} from "../services/reviewsService";

export const useReviews = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const lastParamsRef = useRef({});

  const getReviews = useCallback(
    async (params = {}) => {
      lastParamsRef.current = params;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchReviews(params);

        const data = response?.reviews || [];
        const paginationData = response?.meta
          ? {
            current_page: response.meta.current_page,
            total_pages: response.meta.last_page,
            total: response.meta.total,
          }
          : null;
        const statsData = response?.analytics ?? response?.stats ?? null;

        setReviews(Array.isArray(data) ? data : []);
        setStats(statsData);
        setPagination(paginationData);

        return { data, pagination: paginationData, stats: statsData };
      } catch (err) {
        console.error("Error fetching reviews:", err);
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
        setError(errorMsg);
        toastError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const getReviewById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchReviewById(id);
        const data = response?.data || response;
        setReview(data);
        return data;
      } catch (err) {
        console.error("Error fetching review:", err);
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
        setError(errorMsg);
        toastError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const changeReviewStatus = useCallback(
    async (id, newStatus) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiChangeReviewStatus(id, newStatus);

        if (response && response.status === "success") {
          setReviews((prevReviews) =>
            prevReviews.map((review) =>
              review.id === id
                ? { ...review, review_status: newStatus }
                : review,
            ),
          );

          await getReviews(lastParamsRef.current);

          toastSuccess(
            t("adminDashboard:success.updated", "Updated successfully"),
          );
        }

        return response;
      } catch (err) {
        console.error("Failed to update review status:", err);
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.update_failed", "Failed to update status");
        setError(errorMsg);
        toastError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getReviews, t],
  );

  const deleteReview = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await apiDeleteReview(id);

        setReviews((prevReviews) => prevReviews.filter((r) => r.id !== id));
        await getReviews(lastParamsRef.current);

        toastSuccess(
          t("adminDashboard:success.deleted", "Deleted successfully"),
        );
        return true;
      } catch (err) {
        console.error("Error deleting review:", err);
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.delete_failed", "Failed to delete");
        setError(errorMsg);
        toastError(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getReviews, t],
  );

  return {
    reviews,
    review,
    pagination,
    loading,
    error,
    stats,
    getReviews,
    getReviewById,
    changeReviewStatus,
    deleteReview,
  };
};
