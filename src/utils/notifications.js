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

export const getNotificationsPagePath = (userRole) => {
  if (userRole === "admin") return "/admin/notifications";
  if (userRole === "instructor") return "/instructor/notifications";
  return "/student/notifications";
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
  group_assigned: "bi-people",
  instructor_exam_result: "bi-patch-check",
};

/**
 * Returns the deep-link navigation path for a notification, or null if there
 * is no dedicated page (caller should fall back to the notifications page).
 */
export const getNotificationTarget = (notification, userRole) => {
  const role = userRole || (typeof window !== "undefined"
    ? (window.location.pathname.startsWith("/admin") ? "admin"
       : window.location.pathname.startsWith("/instructor") ? "instructor"
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
