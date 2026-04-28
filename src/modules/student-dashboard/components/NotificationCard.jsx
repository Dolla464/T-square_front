import React from "react";

function NotificationCard({ notification, onMarkAsRead }) {
  const { id, title, message, created_at, is_read } = notification;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now - date;

    // handle future dates
    if (diffMs < 0) return "Just now";

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "Just now";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    }

    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }

    if (diffDays === 1) {
      return "Yesterday";
    }

    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }

    // fallback date
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleClick = () => {
    if (!is_read) {
      onMarkAsRead(id);
    }
  };

  return (
    <div
      className={`notification-card ${is_read ? "" : "notification-unread"}`}
      onClick={handleClick}
      dir="ltr"
    >
      <div className="notification-content">
        <h4 className="notification-title">{title}</h4>
        <p className="notification-message">{message}</p>
      </div>
      <div className="notification-time">
        <span>{formatDate(created_at)}</span>
      </div>
    </div>
  );
}

export default NotificationCard;
