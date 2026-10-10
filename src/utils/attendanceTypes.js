export const VALID_ATTENDANCE_TYPES = ["online", "offline", "hybrid"];

export const ATTENDANCE_TYPE_ONLINE = "online";

export function normalizeAttendanceType(value) {
  if (value == null || value === "") {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();

  return VALID_ATTENDANCE_TYPES.includes(normalized) ? normalized : null;
}

export function resolveCourseAttendanceTypes(course) {
  if (Array.isArray(course?.attendance_types) && course.attendance_types.length > 0) {
    return course.attendance_types
      .map((type) => normalizeAttendanceType(type))
      .filter(Boolean);
  }

  const legacy = normalizeAttendanceType(course?.attendance_type);

  return legacy ? [legacy] : [];
}

export function shouldShowStudentAttendanceNav(enrolledCourses) {
  if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) {
    return true;
  }

  return enrolledCourses.some((course) => {
    const type = normalizeAttendanceType(course?.enrollment?.attendance_type);

    return type === null || type !== ATTENDANCE_TYPE_ONLINE;
  });
}

export function getAttendanceTypeLabel(type, t, options = {}) {
  const normalized = normalizeAttendanceType(type);

  if (!normalized) {
    return options.fallback ?? t("attendance_type.not_assigned", { defaultValue: "Not assigned" });
  }

  return t(`attendance_type.${normalized}`, {
    defaultValue: normalized,
  });
}
