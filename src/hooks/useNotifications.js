import { useCallback, useEffect, useRef, useState } from "react";
import axiosClient from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const normalizeNotification = (notification) => ({
  id: notification?.id,
  title:
    notification?.title ??
    notification?.data?.title ??
    notification?.subject ??
    "Notification",
  message:
    notification?.message ??
    notification?.body ??
    notification?.data?.message ??
    "",
  created_at:
    notification?.created_at ??
    notification?.createdAt ??
    notification?.date ??
    null,
  created_at_human:
    notification?.created_at_human ?? notification?.createdAtHuman ?? null,
  is_read: Boolean(
    notification?.is_read ??
    notification?.read_at ??
    notification?.read ??
    notification?.isRead ??
    false,
  ),
  action_url:
    notification?.action_url ??
    notification?.actionUrl ??
    notification?.data?.action_url ??
    null,
  data: notification?.data ?? null,
});

const getNotificationsPayload = (response) => {
  const payload = response?.data ?? {};

  if (Array.isArray(payload)) {
    return { items: payload, meta: {} };
  }

  const items = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.notifications)
      ? payload.notifications
      : [];

  const meta = payload?.meta ?? payload?.pagination ?? {};

  return { items, meta };
};

const formatTimeAgoClient = (value, humanValue) => {
  if (humanValue) return humanValue;
  if (!value) return "just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

export const useNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);
  const isDropdownOpenRef = useRef(false);

  const fetchNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      try {
        if (!silent) setIsLoading(true);

        const response = await axiosClient.get("/notifications");
        const { items, meta } = getNotificationsPayload(response);

        setNotifications(items.map(normalizeNotification));
        setUnreadCount(
          Number(meta?.unread_count ?? response?.data?.unread_count ?? 0) || 0,
        );
        setError(null);
      } catch (err) {
        console.error("Failed to load notifications", err);
        setError(err);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [token],
  );

  const fetchUnreadCountOnly = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axiosClient.get("/notifications/unread-count");
      setUnreadCount(response.data?.data?.unread_count ?? 0);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Load once on mount
    fetchNotifications({ silent: false });

    let intervalId;

    const startPolling = () => {
      // Use lightweight endpoint if dropdown is closed
      const fetchFn = isDropdownOpenRef.current
        ? () => fetchNotifications({ silent: true })
        : () => fetchUnreadCountOnly();

      intervalId = window.setInterval(fetchFn, 30000);
    };

    const stopPolling = () => {
      window.clearInterval(intervalId);
    };

    // Polling only when tab is active
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
        // Refresh immediately when user comes back
        if (isDropdownOpenRef.current) {
          fetchNotifications({ silent: true });
        } else {
          fetchUnreadCountOnly();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications, fetchUnreadCountOnly, token]);

  const markAsRead = useCallback(
    async (id) => {
      if (!token) return;

      const currentNotification = notifications.find((item) => item.id === id);
      if (currentNotification?.is_read) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await axiosClient.post(`/notifications/${id}/read`);
      } catch (err) {
        console.error("Failed to mark notification as read", err);
        // Revert on failure
        await fetchNotifications({ silent: true });
        throw err;
      }
    },
    [fetchNotifications, notifications, token],
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true })),
    );
    setUnreadCount(0);

    try {
      await axiosClient.post("/notifications/read-all");
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
      // Revert on failure
      await fetchNotifications({ silent: true });
      throw err;
    }
  }, [fetchNotifications, token]);

  const setDropdownOpen = useCallback(
    (isOpen) => {
      isDropdownOpenRef.current = isOpen;
      if (isOpen) {
        fetchNotifications({ silent: false });
      }
    },
    [fetchNotifications],
  );

  const formatTimeAgo = useCallback((notification) => {
    return formatTimeAgoClient(
      notification?.created_at,
      notification?.created_at_human,
    );
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    setDropdownOpen,
    formatTimeAgo,
  };
};

export const useUnreadCount = () => {
  const { unreadCount, isLoading, refetch } = useNotifications();
  return { unreadCount, isLoading, refetch };
};

export const useMarkAsRead = () => {
  const { markAsRead } = useNotifications();
  return markAsRead;
};

export const useMarkAllAsRead = () => {
  const { markAllAsRead } = useNotifications();
  return markAllAsRead;
};

export default useNotifications;
