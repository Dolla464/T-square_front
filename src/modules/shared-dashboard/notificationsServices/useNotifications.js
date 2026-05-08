import { useState, useEffect } from "react";
import axiosClient from "../../../api/axios";

const getStudentNotifications = () => axiosClient.get("/notifications");
const markNotificationAsRead = (id) =>
  axiosClient.post(`/notifications/${id}/read`);
const markAllNotificationsAsRead = () =>
  axiosClient.post("/notifications/read-all");

export const useNotifications = () => {
  const [notificationsData, setNotificationsData] = useState({
    data: [],
    unread_count: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      const response = await getStudentNotifications();
      const { data, meta } = response.data;
      setNotificationsData({
        data: data || [],
        unread_count: meta?.unread_count || 0,
        total: meta?.total || 0,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      // تحديث الحالة محلياً أولاً لتحسين استجابة الواجهة
      setNotificationsData((prev) => {
        const isAlreadyRead = prev.data.find(n => n.id === id)?.is_read;
        return {
          ...prev,
          data: prev.data.map((notification) =>
            notification.id === id
              ? { ...notification, is_read: true }
              : notification
          ),
          unread_count: isAlreadyRead ? prev.unread_count : Math.max(0, prev.unread_count - 1)
        };
      });

      await markNotificationAsRead(id);
    } catch (err) {
      console.error(err);
      // إرجاع الحالة في حال فشل الطلب (اختياري)
    }
  };

  const markNotificationAllRead = async () => {
    try {
      setNotificationsData((prev) => ({
        ...prev,
        data: prev.data.map((notification) => ({ ...notification, is_read: true })),
        unread_count: 0
      }));

      await markAllNotificationsAsRead();
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notificationsData,
    loading,
    error,
    handleMarkAsRead,
    markNotificationAllRead,
    refreshNotifications: fetchNotifications
  };
};
