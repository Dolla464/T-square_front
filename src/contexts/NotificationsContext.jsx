import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axiosClient from "../api/axios";
import { useAuth } from "./AuthContext";
import { formatDateTime } from "../utils/formatDateTime";
import {
  getNotificationsPayload,
  normalizeNotification,
} from "../utils/notifications";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });
  const isDropdownOpenRef = useRef(false);
  const currentPageRef = useRef(1);

  const fetchNotifications = useCallback(
    async ({ silent = false, page = 1 } = {}) => {
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        setPagination({
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 15,
        });
        setIsLoading(false);
        return;
      }

      try {
        if (!silent) setIsLoading(true);

        const response = await axiosClient.get("/notifications", {
          params: { page },
        });
        const { items, meta } = getNotificationsPayload(response);

        setNotifications(items.map(normalizeNotification));
        setUnreadCount(
          Number(meta?.unread_count ?? response?.data?.unread_count ?? 0) || 0,
        );
        setPagination({
          current_page: Number(meta?.current_page ?? page) || 1,
          last_page: Number(meta?.last_page ?? 1) || 1,
          total: Number(meta?.total ?? items.length) || 0,
          per_page: Number(meta?.per_page ?? 15) || 15,
        });
        currentPageRef.current = Number(meta?.current_page ?? page) || 1;
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
      setTimeout(() => {
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        setError(null);
      }, 0);
      return;
    }

    setTimeout(() => {
      fetchNotifications({ silent: false, page: 1 });
    }, 0);

    let intervalId;

    const startPolling = () => {
      const isNotificationsPage = window.location.pathname.endsWith("/notifications");
      const fetchFn = (isDropdownOpenRef.current || isNotificationsPage)
        ? () =>
            fetchNotifications({
              silent: true,
              page: currentPageRef.current,
            })
        : () => fetchUnreadCountOnly();

      intervalId = window.setInterval(fetchFn, 4000);
    };

    const stopPolling = () => {
      window.clearInterval(intervalId);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
        const isNotificationsPage = window.location.pathname.endsWith("/notifications");
        if (isDropdownOpenRef.current || isNotificationsPage) {
          fetchNotifications({ silent: true, page: currentPageRef.current });
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
        await fetchNotifications({
          silent: true,
          page: pagination.current_page,
        });
        throw err;
      }
    },
    [fetchNotifications, notifications, pagination.current_page, token],
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true })),
    );
    setUnreadCount(0);

    try {
      await axiosClient.post("/notifications/read-all");
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
      await fetchNotifications({
        silent: true,
        page: pagination.current_page,
      });
      throw err;
    }
  }, [fetchNotifications, pagination.current_page, token]);

  const setDropdownOpen = useCallback(
    (isOpen) => {
      isDropdownOpenRef.current = isOpen;
      if (isOpen) {
        fetchNotifications({ silent: false, page: pagination.current_page });
      }
    },
    [fetchNotifications, pagination.current_page],
  );

  const goToPage = useCallback(
    (page) => {
      fetchNotifications({ silent: false, page });
    },
    [fetchNotifications],
  );

  const formatTimeAgo = useCallback((notification, locale) => {
    return formatDateTime(notification?.created_at, locale);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      pagination,
      userRole: user?.role ?? null,
      refetch: fetchNotifications,
      markAsRead,
      markAllAsRead,
      setDropdownOpen,
      goToPage,
      formatTimeAgo,
      notificationsData: {
        data: notifications,
        unread_count: unreadCount,
        total: pagination.total,
      },
      handleMarkAsRead: markAsRead,
      markNotificationAllRead: markAllAsRead,
      refreshNotifications: () =>
        fetchNotifications({ silent: false, page: pagination.current_page }),
      loading: isLoading,
    }),
    [
      error,
      fetchNotifications,
      formatTimeAgo,
      goToPage,
      isLoading,
      markAllAsRead,
      markAsRead,
      notifications,
      pagination,
      setDropdownOpen,
      unreadCount,
      user?.role,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotificationsContext() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotificationsContext must be used within NotificationsProvider",
    );
  }

  return context;
}

export default NotificationsProvider;
