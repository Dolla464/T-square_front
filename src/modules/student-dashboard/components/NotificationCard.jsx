import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "../../../utils/formatDateTime";
import { useNotifications } from "../../../hooks/useNotifications";
import {
  NOTIFICATION_ICON_MAP,
  resolveNotificationUrl,
} from "../../../utils/notifications";

function NotificationCard({ notification }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { markAsRead, userRole } = useNotifications();
  const isArabic = i18n.language?.startsWith("ar");
  const { id, type, title, message, icon, created_at, is_read } = notification;

  const formattedDate = formatDateTime(
    created_at,
    isArabic ? "ar-EG" : "en-GB",
  );

  const iconClass =
    icon && icon.startsWith("bi-")
      ? icon
      : NOTIFICATION_ICON_MAP[type] ?? "bi-bell";

  const handleClick = async () => {
    if (!is_read) {
      await markAsRead(id);
    }

    const targetUrl = resolveNotificationUrl(notification, userRole);
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  return (
    <div
      className={`notification-card ${is_read ? "" : "notification-unread"}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      dir="ltr"
    >
      <div className="notification-icon-wrap">
        <i className={`bi ${iconClass}`} aria-hidden="true" />
      </div>
      <div className="notification-content">
        <h4 className="notification-title">{title}</h4>
        <p className="notification-message">{message}</p>
      </div>
      <div className="notification-time">
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}

export default NotificationCard;
