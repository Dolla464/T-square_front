export function isAttended(session) {
  return (
    session?.student_status === "present" || session?.student_status === "late"
  );
}

export function isFinalizedAbsent(session) {
  if (!session || session.status === "cancelled") {
    return false;
  }

  return (
    session.status === "completed" &&
    (session.student_status === "absent" ||
      session.student_status === "not_marked")
  );
}

export function canCheckInToday(session) {
  if (!session) {
    return false;
  }

  if (session.status === "cancelled" || session.status === "completed") {
    return false;
  }

  return (
    Boolean(session.qr_available) &&
    session.student_status !== "present" &&
    session.student_status !== "late"
  );
}

export function getTodayHeroMessageKey(session) {
  if (!session) {
    return "attendance.noSessionsToday";
  }

  if (isAttended(session)) {
    return "attendance.alreadyMarked";
  }

  if (session.status === "cancelled") {
    return "attendance.sessionCancelled";
  }

  if (isFinalizedAbsent(session)) {
    return "attendance.sessionEndedAbsent";
  }

  if (session.qr_available) {
    return "attendance.readyToCheckIn";
  }

  if (session.status === "upcoming") {
    return "attendance.sessionUpcoming";
  }

  if (session.qr_window?.start && session.qr_window?.end) {
    return "attendance.qrWindow";
  }

  return "attendance.qrNotAvailable";
}
