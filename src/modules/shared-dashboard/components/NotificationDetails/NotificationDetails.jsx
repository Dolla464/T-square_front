import { useTranslation } from "react-i18next";
import { getNotificationDetailItems } from "../../../../utils/notifications";

const DETAIL_ICONS = {
  course: "bi-book",
  group: "bi-people",
  student: "bi-person",
  exam: "bi-journal-text",
  score: "bi-graph-up",
  status: "bi-flag",
  time: "bi-clock",
  room: "bi-geo-alt",
  date: "bi-calendar3",
  startDate: "bi-calendar-event",
  reason: "bi-info-circle",
  oldSchedule: "bi-arrow-left",
  newSchedule: "bi-arrow-right",
};

function NotificationDetails({ notification, variant, maxItems }) {
  const { t, i18n } = useTranslation("studentDashboard");
  const locale = i18n.language?.startsWith("ar") ? "ar-EG" : "en-GB";
  const items = getNotificationDetailItems(notification, t, locale);
  const visibleItems =
    typeof maxItems === "number" ? items.slice(0, maxItems) : items;

  if (!visibleItems.length) {
    return null;
  }

  if (variant === "dropdown") {
    return (
      <ul className="notification-details notification-details--dropdown">
        {visibleItems.map((item) => (
          <li
            key={item.key}
            className={`notification-details-chip${
              item.variant
                ? ` notification-details-chip--${item.variant}`
                : ""
            }`}
          >
            <span className="notification-details-chip-label">{item.label}</span>
            <span
              className="notification-details-chip-value"
              title={item.value}
            >
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className="notification-details notification-details--card">
      {visibleItems.map((item) => (
        <div key={item.key} className="notification-details-row">
          <dt className="notification-details-label">
            <i
              className={`bi ${DETAIL_ICONS[item.key] ?? "bi-dot"}`}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </dt>
          <dd
            className={`notification-details-value${
              item.variant
                ? ` notification-details-value--${item.variant}`
                : ""
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default NotificationDetails;
