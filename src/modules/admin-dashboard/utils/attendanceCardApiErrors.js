import { getApiErrorMessage, getApiErrorMeta } from "../../../utils/apiErrors";

/**
 * User-facing message for attendance card admin API errors (never includes raw tokens).
 */
export function getAttendanceCardErrorMessage(error, t) {
  const { status, code } = getApiErrorMeta(error);
  const ns = "students_page.attendance_card.errors";

  if (code === "CARD_ALREADY_ACTIVE") {
    return t(`${ns}.card_already_active`);
  }
  if (code === "NO_ACTIVE_CARD") {
    return t(`${ns}.no_active_card`);
  }
  if (status === 401) {
    return t(`${ns}.session_expired`);
  }
  if (status === 403) {
    return t(`${ns}.forbidden`);
  }
  if (status === 404) {
    return t(`${ns}.not_found`);
  }
  if (status === 409) {
    return t(`${ns}.email_unverified`);
  }
  if (status === 429) {
    return t(`${ns}.rate_limit`);
  }
  if (status >= 500) {
    return t(`${ns}.server`);
  }

  return getApiErrorMessage(error, t(`${ns}.generic`));
}

export function extractInactiveWarning(warnings) {
  if (!Array.isArray(warnings)) {
    return null;
  }
  return warnings.find((item) => item?.code === "STUDENT_INACTIVE") ?? null;
}
