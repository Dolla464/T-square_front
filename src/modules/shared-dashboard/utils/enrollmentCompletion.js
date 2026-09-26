export const LEARNING_GROUP_STATUS_COMPLETED = "completed";

/**
 * Whether staff may set a NEW enrollment completion (is_completed → true).
 * Reopening / marking incomplete is not gated here.
 */
export function canEnableEnrollmentCompletion(groupId, groupStatus) {
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
