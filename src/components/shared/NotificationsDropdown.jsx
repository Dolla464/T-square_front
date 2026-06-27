import { useEffect, useState } from "react";
import { Badge, Dropdown, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";

function NotificationsDropdown() {
  const navigate = useNavigate();
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
  } = useNotifications();

  // Notify parent hook about dropdown state for polling strategy
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

    if (notification.action_url) {
      const relativePath = notification.action_url.startsWith("http")
        ? new URL(notification.action_url).pathname
        : notification.action_url;

      navigate(relativePath);
    }

    setShow(false);
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <Dropdown align="end" show={show} onToggle={handleToggle}>
      <Dropdown.Toggle
        variant="link"
        id="notifications-dropdown"
        className="text-decoration-none p-0 border-0 position-relative"
      >
        <i className="bi bi-bell-fill fs-5 text-dark" />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: "320px", maxWidth: "360px" }}>
        <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
          <strong>Notifications</strong>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-link btn-sm p-0"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {isLoading && (
          <div className="px-3 py-4 text-center text-muted">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading...
          </div>
        )}

        {!isLoading && error && (
          <div className="px-3 py-4 text-center text-danger">
            Unable to load notifications right now.
          </div>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <div className="px-3 py-4 text-center text-muted">
            No notifications
          </div>
        )}

        {!isLoading && !error && notifications.length > 0 && (
          <div
            className="py-2"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {notifications.map((notification) => (
              <Dropdown.Item
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
                      {formatTimeAgo(notification)}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <span
                      className="rounded-circle bg-danger flex-shrink-0 mt-1"
                      style={{ width: "8px", height: "8px" }}
                    />
                  )}
                </div>
              </Dropdown.Item>
            ))}
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default NotificationsDropdown;
