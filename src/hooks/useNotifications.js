import { useNotificationsContext } from "../contexts/NotificationsContext";

export const useNotifications = () => {
  const context = useNotificationsContext();

  return {
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    isLoading: context.isLoading,
    error: context.error,
    pagination: context.pagination,
    refetch: context.refetch,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    setDropdownOpen: context.setDropdownOpen,
    goToPage: context.goToPage,
    formatTimeAgo: context.formatTimeAgo,
    userRole: context.userRole,
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
