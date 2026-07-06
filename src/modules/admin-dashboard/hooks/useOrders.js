import { useState, useCallback } from "react";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";
import {
  getReviews,
  getReviewById,
  updatePaymentOrdersById,
  deleteReview,
  exportPayments,
  createOrder as createOrderService,
} from "../services/ordersServices";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const getOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReviews(params);
      const stats = res?.data?.stats;
      const data = res?.data?.orders || [];
      const paginationData = res?.meta || null;
      setStats(stats);
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

  const createOrder = async (payload) => {
    try {
      const res = await createOrderService(payload);
      toastSuccess("Order created successfully.");
      return res?.data || res;
    } catch (err) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const firstMessage = Object.values(errors).flat()[0];
        toastError(firstMessage || "Failed to create order.");
      } else {
        toastError(err?.response?.data?.message || "Failed to create order.");
      }
      throw err;
    }
  };

  const handleExport = useCallback(async (filters, format) => {
    setExportLoading(true);
    try {
      await exportPayments(filters, format);
    } catch (err) {
      toastError(err?.response?.data?.message || "Export failed. Please try again.");
    } finally {
      setExportLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    exportLoading,
    error,
    stats,
    pagination,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    handleExport,
    createOrder,
  };
};
