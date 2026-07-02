export const normalizeNotification = (notification) => ({
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
  action_url:
    notification?.action_url ??
    notification?.actionUrl ??
    notification?.url ??
    notification?.action_link ??
    notification?.data?.action_url ??
    notification?.data?.url ??
    notification?.data?.action_link ??
    null,
  data: notification?.data ?? null,
});

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

const SESSION_TYPES = new Set([
  "session_rescheduled",
  "session_cancelled",
  "session_activated",
]);

const normalizeLegacyActionUrl = (actionUrl) => {
  if (!actionUrl) return null;

  const legacyInstructorSession = actionUrl.match(
    /^\/instructor\/attendance\/sessions\/(\d+)$/,
  );
  if (legacyInstructorSession) {
    return `/instructor/attendance?session=${legacyInstructorSession[1]}`;
  }

  const legacyAdminCourse = actionUrl.match(/^\/admin\/courses\/(\d+)$/);
  if (legacyAdminCourse) {
    return `/admin/courses?course=${legacyAdminCourse[1]}`;
  }

  return actionUrl;
};

export const resolveNotificationUrl = (notification, userRole) => {
  const directUrl = normalizeLegacyActionUrl(notification?.action_url);
  if (directUrl) {
    return directUrl;
  }

  if (!SESSION_TYPES.has(notification?.type)) {
    return null;
  }

  if (userRole === "instructor") {
    if (notification.type === "session_activated" && notification.session_id) {
      return `/instructor/attendance?session=${notification.session_id}`;
    }

    return "/instructor/schedule";
  }

  if (userRole === "student" && notification.course_id) {
    return `/student/course/${notification.course_id}`;
  }

  if (userRole === "admin") {
    return "/admin/schedule";
  }

  return null;
};

export const NOTIFICATION_ICON_MAP = {
  enrollment: "bi-book",
  exam_result: "bi-patch-check",
  certificate: "bi-award",
  session_activated: "bi-calendar-check",
  session_rescheduled: "bi-calendar-event",
  session_cancelled: "bi-calendar-x",
  course_review_required: "bi-star",
  admin_enrollment: "bi-people",
};
