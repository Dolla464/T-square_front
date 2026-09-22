import { formatDateTime } from "./formatDateTime";

const DETAIL_FIELD_KEYS = [
  "course_title",
  "group_name",
  "student_name",
  "exam_title",
  "start_date",
  "enrollment_id",
  "exam_id",
  "attempt_id",
  "student_id",
  "group_id",
  "status",
  "score",
  "session_date",
  "start_time",
  "room",
  "old_date",
  "old_time",
  "new_date",
  "new_time",
  "reason",
];

function isMeaningfulValue(value) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string" && value.trim() === "") {
    return false;
  }

  return true;
}

function pickNotificationField(notification, key) {
  const top = notification?.[key];
  const nested = notification?.data?.[key];

  if (isMeaningfulValue(top)) {
    return top;
  }

  if (isMeaningfulValue(nested)) {
    return nested;
  }

  return null;
}

function pickNotificationNumericField(notification, key) {
  const top = notification?.[key];
  const nested = notification?.data?.[key];
  const raw = top !== undefined && top !== null ? top : nested;

  if (raw === null || raw === undefined || raw === "") {
    return null;
  }

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNotificationDate(value, locale) {
  if (!isMeaningfulValue(value)) {
    return null;
  }

  const stringValue = String(value).trim();
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(stringValue)
    ? `${stringValue}T12:00:00`
    : stringValue;

  const formatted = formatDateTime(normalizedValue, locale);
  return formatted || stringValue;
}

function buildScheduleValue(date, time, locale) {
  const formattedDate = formatNotificationDate(date, locale);
  const hasTime = isMeaningfulValue(time);

  if (formattedDate && hasTime) {
    return `${formattedDate} · ${time}`;
  }

  if (formattedDate) {
    return formattedDate;
  }

  return hasTime ? String(time) : null;
}

function pushDetailItem(items, { key, label, value, variant }) {
  if (!isMeaningfulValue(value)) {
    return;
  }

  items.push({
    key,
    label,
    value: String(value),
    ...(variant ? { variant } : {}),
  });
}

export const normalizeNotification = (notification) => {
  const normalized = {
    id: notification?.id,
    type: notification?.type ?? notification?.data?.type ?? null,
    title:
      notification?.title ??
      notification?.data?.title ??
      notification?.subject ??
      "Notification",
    message:
      notification?.message ??
      notification?.body ??
      notification?.data?.message ??
      "",
    icon: notification?.icon ?? notification?.data?.icon ?? null,
    course_id: notification?.course_id ?? notification?.data?.course_id ?? null,
    session_id: notification?.session_id ?? notification?.data?.session_id ?? null,
    created_at:
      notification?.created_at ??
      notification?.createdAt ??
      notification?.date ??
      null,
    created_at_human:
      notification?.created_at_human ?? notification?.createdAtHuman ?? null,
    is_read: Boolean(
      notification?.is_read ??
        notification?.read_at ??
        notification?.read ??
        notification?.isRead ??
        false,
    ),
    data: notification?.data ?? null,
  };

  for (const key of DETAIL_FIELD_KEYS) {
    if (key === "score") {
      normalized.score = pickNotificationNumericField(notification, key);
      continue;
    }

    if (
      key === "enrollment_id" ||
      key === "exam_id" ||
      key === "attempt_id" ||
      key === "student_id" ||
      key === "group_id"
    ) {
      normalized[key] = pickNotificationNumericField(notification, key);
      continue;
    }

    normalized[key] = pickNotificationField(notification, key);
  }

  return normalized;
};

const EXAM_STATUS_VARIANTS = new Set([
  "passed",
  "failed",
  "awaiting_grading",
]);

function pushExamStatusDetail(items, notification, t) {
  if (!isMeaningfulValue(notification.status)) {
    return;
  }

  const status = String(notification.status);
  const statusKey = `notifications.details.status_${status}`;
  const statusLabel = EXAM_STATUS_VARIANTS.has(status)
    ? t(statusKey)
    : status;

  pushDetailItem(items, {
    key: "status",
    label: t("notifications.details.status"),
    value: statusLabel,
    variant: EXAM_STATUS_VARIANTS.has(status) ? status : undefined,
  });
}

function pushExamResultDetails(items, notification, t) {
  if (notification.score !== null && notification.score !== undefined) {
    pushDetailItem(items, {
      key: "score",
      label: t("notifications.details.score"),
      value: String(notification.score),
    });
  }

  pushExamStatusDetail(items, notification, t);
}

function pushStudentCourseDetails(items, notification, t) {
  pushDetailItem(items, {
    key: "student",
    label: t("notifications.details.student"),
    value: notification.student_name,
  });
  pushDetailItem(items, {
    key: "course",
    label: t("notifications.details.course"),
    value: notification.course_title,
  });
}

export function getNotificationDetailItems(notification, t, locale) {
  if (!notification?.type || typeof t !== "function") {
    return [];
  }

  const items = [];
  const type = notification.type;

  if (
    type === "enrollment" ||
    type === "certificate" ||
    type === "course_review_required"
  ) {
    pushDetailItem(items, {
      key: "course",
      label: t("notifications.details.course"),
      value: notification.course_title,
    });
  }

  if (type === "exam_result") {
    pushExamResultDetails(items, notification, t);
  }

  if (type === "admin_enrollment" || type === "instructor_new_enrollment") {
    pushStudentCourseDetails(items, notification, t);
  }

  if (type === "group_assigned") {
    pushDetailItem(items, {
      key: "course",
      label: t("notifications.details.course"),
      value: notification.course_title,
    });
    pushDetailItem(items, {
      key: "group",
      label: t("notifications.details.group"),
      value: notification.group_name,
    });
    pushDetailItem(items, {
      key: "startDate",
      label: t("notifications.details.startDate"),
      value: formatNotificationDate(notification.start_date, locale),
    });
  }

  if (type === "grading_required") {
    pushDetailItem(items, {
      key: "student",
      label: t("notifications.details.student"),
      value: notification.student_name,
    });
    pushDetailItem(items, {
      key: "exam",
      label: t("notifications.details.exam"),
      value: notification.exam_title,
    });
    pushDetailItem(items, {
      key: "group",
      label: t("notifications.details.group"),
      value: notification.group_name,
    });
    pushExamStatusDetail(items, notification, t);
  }

  if (type === "instructor_exam_result") {
    pushDetailItem(items, {
      key: "student",
      label: t("notifications.details.student"),
      value: notification.student_name,
    });
    pushDetailItem(items, {
      key: "exam",
      label: t("notifications.details.exam"),
      value: notification.exam_title,
    });
    pushDetailItem(items, {
      key: "group",
      label: t("notifications.details.group"),
      value: notification.group_name,
    });
    pushExamResultDetails(items, notification, t);
  }

  if (type === "session_activated") {
    pushDetailItem(items, {
      key: "course",
      label: t("notifications.details.course"),
      value: notification.course_title,
    });
    pushDetailItem(items, {
      key: "group",
      label: t("notifications.details.group"),
      value: notification.group_name,
    });
    pushDetailItem(items, {
      key: "time",
      label: t("notifications.details.time"),
      value: notification.start_time,
    });
    pushDetailItem(items, {
      key: "room",
      label: t("notifications.details.room"),
      value: notification.room,
    });
  }

  if (type === "session_rescheduled") {
    pushDetailItem(items, {
      key: "course",
      label: t("notifications.details.course"),
      value: notification.course_title,
    });
    pushDetailItem(items, {
      key: "group",
      label: t("notifications.details.group"),
      value: notification.group_name,
    });
    pushDetailItem(items, {
      key: "oldSchedule",
      label: t("notifications.details.oldSchedule"),
      value: buildScheduleValue(
        notification.old_date,
        notification.old_time,
        locale,
      ),
    });
    pushDetailItem(items, {
      key: "newSchedule",
      label: t("notifications.details.newSchedule"),
      value: buildScheduleValue(
        notification.new_date,
        notification.new_time,
        locale,
      ),
    });
  }

  if (type === "session_cancelled") {
    pushDetailItem(items, {
      key: "course",
      label: t("notifications.details.course"),
      value: notification.course_title,
    });
    pushDetailItem(items, {
      key: "group",
      label: t("notifications.details.group"),
      value: notification.group_name,
    });
    pushDetailItem(items, {
      key: "date",
      label: t("notifications.details.date"),
      value: formatNotificationDate(notification.session_date, locale),
    });
    pushDetailItem(items, {
      key: "reason",
      label: t("notifications.details.reason"),
      value: notification.reason,
    });
  }

  return items;
}

export const NOTIFICATIONS_PER_PAGE = 30;

export function parseUnreadCount(value) {
  if (Array.isArray(value)) {
    return parseUnreadCount(value[0]);
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/** Sidebar / topbar badge — full unread count (not capped at 9+). */
export function formatNotificationBadge(count) {
  const safe = parseUnreadCount(count);
  if (safe <= 0) {
    return null;
  }

  if (safe > 99) {
    return "99+";
  }

  return safe;
}

export const getNotificationsPayload = (response) => {
  const payload = response?.data ?? {};

  if (Array.isArray(payload)) {
    return { items: payload, meta: {} };
  }

  const items = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.notifications)
      ? payload.notifications
      : [];

  const meta = {
    ...(payload?.meta ?? {}),
    ...(payload?.pagination ?? {}),
  };

  return { items, meta };
};

export const getNotificationsPagePath = (userRole) => {
  if (userRole === "admin") return "/admin/notifications";
  if (userRole === "instructor") return "/instructor/notifications";
  if (userRole === "receptionist") return "/receptionist/notifications";
  return "/student/notifications";
};

export const NOTIFICATION_ICON_MAP = {
  enrollment: "bi-book",
  instructor_new_enrollment: "bi-person-plus",
  exam_result: "bi-patch-check",
  certificate: "bi-award",
  session_activated: "bi-calendar-check",
  session_rescheduled: "bi-calendar-event",
  session_cancelled: "bi-calendar-x",
  course_review_required: "bi-star",
  admin_enrollment: "bi-people",
  group_assigned: "bi-people",
  instructor_exam_result: "bi-patch-check",
  grading_required: "bi-pencil-square",
};

/**
 * Returns the deep-link navigation path for a notification, or null if there
 * is no dedicated page (caller should fall back to the notifications page).
 */
export const getNotificationTarget = (notification, userRole) => {
  const role = userRole || (typeof window !== "undefined"
    ? (window.location.pathname.startsWith("/admin") ? "admin"
       : window.location.pathname.startsWith("/instructor") ? "instructor"
       : window.location.pathname.startsWith("/receptionist") ? "receptionist"
       : "student")
    : "student");

  const type = notification?.type ?? notification?.data?.type;
  const courseId =
    notification?.course_id ?? notification?.data?.course_id ?? null;

  if (role === "admin") {
    switch (type) {
      case "course_review_required":
        return "/admin/reviews";
      case "certificate":
        return "/admin/certificates";
      case "session_activated":
      case "session_rescheduled":
      case "session_cancelled":
        return "/admin/schedule";
      case "exam_result":
      case "instructor_exam_result":
        return "/admin/quizzes";
      case "enrollment":
      case "admin_enrollment":
        return "/admin/orders";
      case "group_assigned":
        return "/admin/groups";
      default:
        return null;
    }
  }

  if (role === "instructor") {
    switch (type) {
      case "session_activated":
      case "session_rescheduled":
      case "session_cancelled":
        return "/instructor/attendance";
      case "grading_required":
        return "/instructor/exam-grading";
      case "exam_result":
      case "instructor_exam_result":
        return "/instructor/student-results";
      case "enrollment":
      case "admin_enrollment":
        return "/instructor/schedule";
      case "group_assigned":
        return "/instructor/schedule";
      default:
        return null;
    }
  }

  if (role === "receptionist") {
    switch (type) {
      case "enrollment":
      case "admin_enrollment":
        return "/receptionist/orders";
      case "group_assigned":
        return "/receptionist/groups";
      default:
        return null;
    }
  }

  // Student role default
  switch (type) {
    case "course_review_required":
      return courseId ? `/student/review/${courseId}` : null;
    case "certificate":
      return "/student/certificates";
    case "session_activated":
    case "session_rescheduled":
    case "session_cancelled":
      return "/student/attendance";
    case "exam_result":
      return "/student/quizzes";
    case "enrollment":
      return courseId ? `/student/course/${courseId}` : "/student/dashboard";
    default:
      return null;
  }
};
