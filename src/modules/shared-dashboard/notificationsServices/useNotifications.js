import { useState, useEffect } from "react";
import axiosClient from "../../../api/axios";

const getStudentNotifications = () => axiosClient.get("/notifications");
const markNotificationAsRead = (id) =>
  axiosClient.post(`/notifications/${id}/read`);
const markAllNotificationsAsRead = () =>
  axiosClient.post("/notifications/read-all");

const normalizeNotificationsData = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.notifications && Array.isArray(data.notifications))
    return data.notifications;
  return [];
};

export const useNotifications = () => {
  const [notificationsData, setNotificationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getStudentNotifications();
        setNotificationsData(normalizeNotificationsData(response.data));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      setNotificationsData((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification,
        ),
      );

      await markNotificationAsRead(id);
    } catch (err) {
      console.error(err);
      setNotificationsData((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: false }
            : notification,
        ),
      );
    }
  };

  const markNotificationAllRead = async () => {
    try {
      setNotificationsData((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true })),
      );

      await markAllNotificationsAsRead();
    } catch (err) {
      console.error(err);
      setNotificationsData((prev) =>
        prev.map((notification) => ({ ...notification, is_read: false })),
      );
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
