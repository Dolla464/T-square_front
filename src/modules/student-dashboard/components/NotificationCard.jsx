import React from "react";

function NotificationCard({ notification, onMarkAsRead }) {
  const { id, title, message, created_at, is_read } = notification;


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
        <span>{created_at}</span>
      </div>
    </div>
  );
}

export default NotificationCard;
