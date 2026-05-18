import { useState, useCallback } from "react";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";
import {
  getReviews, // Actually it fetches from /admin/payments as modified by the user
  getReviewById,
  updatePaymentOrdersById,
  deleteReview
} from "../services/ordersServices";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const getOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReviews(params);
      const data = res?.data || res?.payments || [];
      const paginationData = res?.pagination || res?.meta || null;

      setOrders(Array.isArray(data) ? data : []);
      setPagination(paginationData);
      return data;
    } catch (err) {
      setError(err);
      toastError(err?.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderById = async (id) => {
    try {
      const res = await getReviewById(id);
      return res?.data || res;
    } catch (err) {
      toastError(err?.response?.data?.message || "Failed to fetch order details.");
      throw err;
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await updatePaymentOrdersById(id, { status });
      toastSuccess("Order status updated successfully.");
      return true;
    } catch (err) {
      toastError(err?.response?.data?.message || "Failed to update order status.");
      return false;
    }
  };

  const deleteOrder = async (id) => {
    try {
      await deleteReview(id);
      toastSuccess("Order deleted successfully.");
      return true;
    } catch (err) {
      toastError(err?.response?.data?.message || "Failed to delete order.");
      return false;
    }
  };

  return {
    orders,
    loading,
    error,
    pagination,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
  };
};
