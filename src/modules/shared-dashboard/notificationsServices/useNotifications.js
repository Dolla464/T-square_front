import { useState, useEffect } from "react";

/**
 * جلب الاشعارات الخاصه بالطالب
 */
const getStudentNotifications = () => axiosClient.get("/notifications");
const markNotificationAsRead = (id) =>
  axiosClient.post(`/notifications/${id}/read`);
const markNotificationAllRead = (id) =>
  axiosClient.post(`/notifications/notifications/read-all`);

const handleMarkAllAsRead = () => {
  setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

  toastCustom({
    message: isArabic
      ? "تم تحديد جميع الإشعارات كمقروءة"
      : "All notifications marked as read",
    type: "success",
    bsIcon: "bi-check2-all",
    duration: 3000,
  });
};
export const useNotifications = () => {
  const [notificationsData, setآotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFromAPI = async () => {
      try {
        const res = await getStudentNotifications();
        setNotifications(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFromAPI();
  }, []);

  //  mark as read (UI + backend sync)
  const handleMarkAsRead = async (id) => {
    try {
      // optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );

      // backend sync
      await markNotificationAsRead(id);
    } catch (err) {
      console.error(err);

      // rollback لو حصل error
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
      );
    }
  };
  const markNotificationAllRead = async () => {
    try {
      // optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      // backend sync
      await markNotificationAllReadAPI();
    } catch (err) {
      console.error(err);

      // rollback لو حصل error
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: false })));
    }
  };

  return {
    notificationsData,
    loading,
    error,
    handleMarkAsRead,
    markNotificationAllRead,
  };
};
