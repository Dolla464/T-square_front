import { useEffect, useState } from "react";
import { Dropdown, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { resolveNotificationUrl } from "../../utils/notifications";
import "./NotificationsDropdown.css";

const getIconForNotification = (notification) => {
  const type = notification.type || "";
  if (type.includes("quiz") || type.includes("exam")) return "bi-journal-check";
  if (type.includes("attendance")) return "bi-calendar-check";
  if (type.includes("payment")) return "bi-credit-card";
  return "bi-bell";
};

function NotificationsDropdown({ isDarkMode, Tbtn }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");
  const locale = isArabic ? "ar-EG" : "en-GB";
  const [show, setShow] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    setDropdownOpen,
    formatTimeAgo,
    userRole,
  } = useNotifications();

  useEffect(() => {
    setDropdownOpen(show);
  }, [show, setDropdownOpen]);

  const handleToggle = (nextShow) => {
    setShow(nextShow);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    const targetUrl = resolveNotificationUrl(notification, userRole);
    if (targetUrl) {
      navigate(targetUrl);
    }

    setShow(false);
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <Dropdown show={show} onToggle={handleToggle}>
      <Dropdown.Toggle
        as="button"
        id="notifications-dropdown"
        className={`search-trigger-btn position-relative ${Tbtn}`}
        title={isArabic ? "الإشعارات" : "Notifications"}
        aria-label={isArabic ? "الإشعارات" : "Notifications"}
      >
        <i className="bi bi-bell" />
        {unreadCount > 0 && (
          <span
            className="badge bg-danger rounded-pill position-absolute"
            style={{
              fontSize: "0.6rem",
              top: "-2px",
              right: "-2px",
              padding: "4px 6px",
              minWidth: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 2px var(--bs-body-bg, #fff)"
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notifications-dropdown-menu" style={{ minWidth: "320px", maxWidth: "360px" }}>
        <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center" style={{ background: "#f8fafc" }}>
          <strong className="text-dark" style={{ fontSize: "0.85rem" }}>{t("notifications.title")}</strong>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-link btn-sm p-0 text-decoration-none text-danger fw-semibold"
              style={{ fontSize: "0.8rem" }}
              onClick={handleMarkAllAsRead}
            >
              {t("notifications.markAllRead")}
            </button>
          )}
        </div>

        {isLoading && (
          <div className="px-3 py-4 text-center text-muted">
            <Spinner animation="border" size="sm" className="me-2" />
            {t("notifications.loading")}
          </div>
        )}

        {!isLoading && error && (
          <div className="px-3 py-4 text-center text-danger">
            {t("notifications.loadError")}
          </div>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <div className="px-3 py-4 text-center text-muted">
            {t("notifications.emptyShort")}
          </div>
        )}

        {!isLoading && !error && notifications.length > 0 && (
          <div
            className="notifications-scroll-area py-1"
            style={{ maxHeight: "360px", overflowY: "auto" }}
          >
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`notification-item ${notification.is_read ? "" : "unread"}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  <i className={`bi ${getIconForNotification(notification)}`}></i>
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-desc">{notification.message}</div>
                  <div className="notification-time">{formatTimeAgo(notification, locale)}</div>
                </div>
                {!notification.is_read && <span className="notification-dot"></span>}
              </button>
            ))}
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default NotificationsDropdown;
