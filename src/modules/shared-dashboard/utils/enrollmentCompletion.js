import { ATTENDANCE_TYPE_ONLINE } from "../../../utils/attendanceTypes";

export const LEARNING_GROUP_STATUS_COMPLETED = "completed";

/**
 * Whether staff may set a NEW enrollment completion (is_completed → true).
 * Reopening / marking incomplete is not gated here.
 */
export function canEnableEnrollmentCompletion(
  attendanceType,
  groupId,
  groupStatus,
) {
  if (attendanceType === ATTENDANCE_TYPE_ONLINE) {
    return true;
  }

  if (!groupId) {
    return false;
  }

  if (!groupStatus) {
    return false;
  }

  return groupStatus === LEARNING_GROUP_STATUS_COMPLETED;
}

/**
 * Whether the UI should offer the "completed" option for a student row.
 * Already-completed enrollments remain visible even when the group is not closed.
 */
export function canSelectEnrollmentCompletedOption(
  groupStatus,
  isAlreadyCompleted,
) {
  if (isAlreadyCompleted) {
    return true;
  }

  return groupStatus === LEARNING_GROUP_STATUS_COMPLETED;
}

/**
 * UI hint when completion is blocked. Online enrollments never require a group.
 */
export function getCompletionBlockReason(
  { attendance_type: attendanceType, group_id: groupId, is_completed: isCompleted },
  t,
) {
  if (isCompleted) {
    return null;
  }

  if (attendanceType === ATTENDANCE_TYPE_ONLINE) {
    return null;
  }

  if (!groupId) {
    return t("students_page.completion_requires_group");
  }

  return t("students_page.completion_requires_closed_group");
}
