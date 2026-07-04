import { useEffect, useState } from "react";
import { Badge, NavDropdown, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { resolveNotificationPath } from "../../utils/notifications";
import "./NotificationsDropdown.css";

function NotificationsDropdown({ Tbtn = "" }) {
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

    navigate(resolveNotificationPath(notification, userRole));
    setShow(false);
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <NavDropdown
      title={
        <span className="notifications-bell-toggle">
          <i className="bi bi-bell-fill fs-5" />
          {unreadCount > 0 && (
            <Badge
              bg="danger"
              pill
              className="notifications-bell-badge"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </span>
      }
      id="notifications-dropdown"
      align="end"
      show={show}
      onToggle={handleToggle}
      className={`fw-bold notifications-nav-dropdown ${Tbtn}`}
      menuVariant="light"
      menuClassName="notifications-nav-dropdown-menu"
    >
        <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
          <strong>{t("notifications.title")}</strong>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-link btn-sm p-0"
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
            className="py-2"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {notifications.map((notification) => (
              <NavDropdown.Item
                key={notification.id}
                as="button"
                className={`border-0 rounded-0 px-3 py-2 ${
                  notification.is_read ? "" : "bg-light"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div className="flex-grow-1 text-start">
                    <div className="fw-semibold small">
                      {notification.title}
                    </div>
                    <div className="small text-muted">
                      {notification.message}
                    </div>
                    <div className="small text-secondary mt-1">
                      {formatTimeAgo(notification, locale)}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <span
                      className="rounded-circle bg-danger flex-shrink-0 mt-1"
                      style={{ width: "8px", height: "8px" }}
                    />
                  )}
                </div>
              </NavDropdown.Item>
            ))}
          </div>
        )}
    </NavDropdown>
  );
}

export default NotificationsDropdown;
