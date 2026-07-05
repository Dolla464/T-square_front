import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../../../utils/formatDateTime";
import { useNotifications } from "../../../hooks/useNotifications";
import {
  NOTIFICATION_ICON_MAP,
  resolveNotificationPath,
  getNotificationsPagePath,
} from "../../../utils/notifications";

function NotificationCard({ notification }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
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

  const targetPath = resolveNotificationPath(notification, userRole);
  const hasAction = targetPath && targetPath !== getNotificationsPagePath(userRole);

  const handleCardClick = async () => {
    if (!is_read) {
      await markAsRead(id);
    }
  };

  const handleActionClick = async (e) => {
    e.stopPropagation();
    if (!is_read) {
      await markAsRead(id);
    }
    navigate(targetPath);
  };

  return (
    <div
      className={`notification-card ${is_read ? "" : "notification-unread"}`}
      onClick={handleCardClick}
      dir="ltr"
    >
      <div className="notification-icon-wrap">
        <i className={`bi ${iconClass}`} aria-hidden="true" />
      </div>
      <div className="notification-content">
        <h4 className="notification-title">{title}</h4>
        <p className="notification-message">{message}</p>
      </div>
      <div className="notification-time-action">
        <div className="notification-time">
          <span>{formattedDate}</span>
        </div>
        {hasAction && (
          <button
            type="button"
            className="notification-action-btn"
            onClick={handleActionClick}
          >
            {isArabic ? "عرض التفاصيل" : "View Details"}
            <i className="bi bi-arrow-right-short" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default NotificationCard;
