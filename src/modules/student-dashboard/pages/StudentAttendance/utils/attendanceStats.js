export function computeOverallAttendanceStats(summary) {
  if (!summary || summary.length === 0) {
    return { pct: 0, present: 0, absent: 0, total: 0 };
  }

  let present = 0;
  let total = 0;

  summary.forEach((group) => {
    present += group.attended_sessions ?? 0;
    total += group.total_sessions ?? 0;
  });

  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const absent = Math.max(0, total - present);

  return { pct, present, absent, total };
}

export function pickDefaultSession(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return null;
  }

  return (
    sessions.find((session) => session.qr_available) ||
    sessions.find((session) => session.status === "active") ||
    sessions.find((session) => session.status === "upcoming") ||
    sessions[0]
  );
}
