import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toastCustom } from "../../../../components/shared/Toaster/toaster";
import { NOTIFICATIONS_MOCK } from "../../data/dashboardMockData";
import NotificationCard from "../../components/NotificationCard";
import "../../styles/dashboardShared.css";

/**
 * صفحة الإشعارات - NotificationsPage
 * تعرض جميع إشعارات المستخدم مع إمكانية تحديدها كمقروءة
 */
function NotificationsPage() {
  const { i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language === "ar";

  // state الإشعارات
  const [notifications, setNotifications] = useState(NOTIFICATIONS_MOCK);
  const [loading] = useState(false);

  /**
   * عدد الإشعارات غير المقروءة
   */
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  /**
   * ترتيب الإشعارات (الأحدث أولاً)
   */
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      // fallback لو التاريخ بايظ
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;

      return dateB - dateA;
    });
  }, [notifications]);

  /**
   * تحديد إشعار كمقروء
   */
  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  /**
   * تحديد كل الإشعارات كمقروءة
   */
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

  /**
   * حالة اللودينج
   */
  if (loading) {
    return (
      <div className="dash-loading">
        <div className="spinner-border text-danger" role="status" />
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* شريط العنوان */}
      <div className="notifications-toolbar">
        <h4 className="notifications-page-title">
          {isArabic ? "الإشعارات" : "Notifications"}

          {unreadCount > 0 && (
            <span className="notifications-count-badge">{unreadCount}</span>
          )}
        </h4>

        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
            <i className="bi bi-check2-all"></i>
            {isArabic ? "تحديد الكل كمقروء" : "Mark all as read"}
          </button>
        )}
      </div>

      {/* قائمة الإشعارات */}
      {sortedNotifications.length === 0 ? (
        <div className="notifications-empty">
          <i className="bi bi-bell-slash notifications-empty-icon"></i>
          <p>{isArabic ? "لا توجد إشعارات حالياً" : "No notifications yet"}</p>
        </div>
      ) : (
        <div className="notifications-list">
          {sortedNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
