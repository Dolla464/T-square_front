import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  toastSuccess,
  toastError,
} from "../../../components/shared/Toaster/toaster";
import {
  getMessages as apiGetMessages,
  getMessageById as apiGetMessageById,
  deleteMessage as apiDeleteMessage,
} from "../services/messagesService";

export const useMessages = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // جلب الرسائل من الخدمة مع تصفية البحث والترقيم
  const getMessages = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGetMessages(params);
        const data = response?.data?.messages || response?.messages || [];
        const paginationData = response?.meta
          ? {
              current_page: response.meta.current_page,
              total_pages: response.meta.last_page,
              total: response.meta.total,
            }
          : null;

        setMessages(Array.isArray(data) ? data : []);
        setPagination(paginationData);

        return { data, pagination: paginationData };
      } catch (err) {
        console.error("Error fetching messages:", err);
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

  // جلب تفاصيل رسالة محددة بالـ ID
  const getMessageById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGetMessageById(id);
        const data = response?.data || response;
        setSelectedMessage(data);
        return data;
      } catch (err) {
        console.error("Error fetching message details:", err);
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

  // حذف رسالة
  const deleteMessage = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await apiDeleteMessage(id);
        toastSuccess(t("adminDashboard:success.deleted", "Deleted successfully"));
        return true;
      } catch (err) {
        console.error("Error deleting message:", err);
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
    [t],
  );

  return {
    messages,
    selectedMessage,
    setSelectedMessage,
    pagination,
    loading,
    error,
    getMessages,
    getMessageById,
    deleteMessage,
  };
};
