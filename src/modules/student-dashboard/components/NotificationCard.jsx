import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../../../utils/formatDateTime";
import { useNotifications } from "../../../hooks/useNotifications";
import {
  NOTIFICATION_ICON_MAP,
  getNotificationTarget,
} from "../../../utils/notifications";

function NotificationCard({ notification }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();
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

  const target = getNotificationTarget(notification);

  const handleCardClick = async () => {
    if (!is_read) {
      await markAsRead(id);
    }
    if (target) {
      navigate(target);
    }
  };

  const handleNavigateClick = async (e) => {
    e.stopPropagation();
    if (!is_read) {
      await markAsRead(id);
    }
    if (target) {
      navigate(target);
    }
  };

  return (
    <div
      className={`notification-card ${is_read ? "" : "notification-unread"} ${target ? "notification-clickable" : ""}`}
      onClick={handleCardClick}
      dir="ltr"
      style={target ? { cursor: "pointer" } : undefined}
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
        {target && (
          <button
            type="button"
            className="btn btn-danger d-flex align-items-center gap-2 rounded-3 px-3 py-1.5 fw-semibold text-white shadow-sm border-0 mt-2 btn-sm"
            onClick={handleNavigateClick}
            style={{ fontSize: "0.78rem" }}
          >
            {isArabic ? "ذهاب" : "Go"}
            <i className="bi bi-send"></i>
          </button>
        )}
      </div>
    </div>
  );
}

export default NotificationCard;
