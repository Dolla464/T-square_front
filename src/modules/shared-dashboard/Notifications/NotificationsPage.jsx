import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toastCustom } from "../../../components/shared/Toaster/toaster";
import NotificationCard from "../../student-dashboard/components/NotificationCard";
import "../components/DashboardLayout/DashboardSharedLayout";
import { useNotifications } from "../../../hooks/useNotifications";
import AdminPagination from "../../admin-dashboard/components/shared/AdminPagination";

function NotificationsPage() {
  const { t } = useTranslation("studentDashboard");

  const {
    notifications,
    unreadCount,
    isLoading,
    pagination,
    markAllAsRead,
    goToPage,
  } = useNotifications();

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();

    toastCustom({
      message: t("notifications.markAllSuccess"),
      type: "success",
      bsIcon: "bi-check2-all",
      duration: 3000,
    });
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="dash-loading">
        <div className="spinner-border text-danger" role="status" />
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-toolbar">
        <h4 className="notifications-page-title">
          {t("notifications.title")}
          {unreadCount > 0 && (
            <span className="notifications-count-badge">{unreadCount}</span>
          )}
        </h4>

        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
            <i className="bi bi-check2-all"></i>
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      {sortedNotifications.length === 0 ? (
        <div className="notifications-empty">
          <i className="bi bi-bell-slash notifications-empty-icon"></i>
          <p>{t("notifications.empty")}</p>
        </div>
      ) : (
        <>
          <div className="notifications-list">
            {sortedNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>

          {pagination.last_page > 1 && (
            <AdminPagination
              pagination={pagination}
              onPageChange={(page) => !isLoading && goToPage(page)}
              wrapperClassName="d-flex justify-content-center mt-4"
            />
          )}
        </>
      )}
    </div>
  );
}

export default NotificationsPage;
