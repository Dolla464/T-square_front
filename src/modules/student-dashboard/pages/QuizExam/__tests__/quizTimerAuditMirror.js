/**
 * AUDIT MIRROR — mirrors QuizTimer logic from QuizExamPage.jsx (lines 54–85, 135–138).
 * NOT production code. Used only for read-only timer audit tests.
 * Source: src/modules/student-dashboard/pages/QuizExam/QuizExamPage.jsx
 */

export function getEndTimeMs({ deadlineAt, startedAt, durationMins }) {
  if (deadlineAt) {
    const deadlineMs = new Date(deadlineAt).getTime();
    if (!Number.isNaN(deadlineMs)) {
      return deadlineMs;
    }
  }

  if (startedAt && durationMins > 0) {
    const startMs = new Date(startedAt).getTime();
    if (!Number.isNaN(startMs)) {
      return startMs + durationMins * 60 * 1000;
    }
  }

  return null;
}

export function calculateTimeLeft({ deadlineAt, startedAt, durationMins, remainingSeconds, nowMs = Date.now() }) {
  const endTime = getEndTimeMs({ deadlineAt, startedAt, durationMins });

  if (endTime) {
    const difference = endTime - nowMs;
    return difference <= 0 ? 0 : Math.floor(difference / 1000);
  }

  if (typeof remainingSeconds === "number") {
    return Math.max(0, remainingSeconds);
  }

  return null;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatTimerDiagnostic({
  label,
  duration,
  startedAt,
  deadlineAt,
  serverTime,
  remainingSeconds,
  nowMs = Date.now(),
}) {
  const endTimeMs = getEndTimeMs({
    deadlineAt,
    startedAt,
    durationMins: parseFloat(duration),
  });
  const calculatedRemaining = calculateTimeLeft({
    deadlineAt,
    startedAt,
    durationMins: parseFloat(duration),
    remainingSeconds,
    nowMs,
  });

  return {
    label,
    duration,
    started_at: startedAt,
    deadline_at: deadlineAt,
    server_time: serverTime,
    remaining_seconds: remainingSeconds,
    Date_now: nowMs,
    calculated_deadline_ms: endTimeMs,
    calculated_remaining_ms: endTimeMs ? Math.max(0, endTimeMs - nowMs) : null,
    calculated_remaining_seconds: calculatedRemaining,
    rendered_timer_value: calculatedRemaining === null ? null : formatTime(calculatedRemaining),
  };
}

/** Valid 10-minute exam payload at T=2026-01-01T10:00:00Z */
export function buildValidTenMinutePayload(overrides = {}) {
  return {
    duration: 10,
    started_at: "2026-01-01T10:00:00Z",
    deadline_at: "2026-01-01T10:10:00Z",
    remaining_seconds: 600,
    server_time: "2026-01-01T10:00:00Z",
    is_timed_out: false,
    status: "ongoing",
    ...overrides,
  };
}

/**
 * Simulates QuizTimer dual-effect behavior (interval init + remainingSeconds snap).
 * Returns { afterIntervalInit, afterServerSnap } without React.
 */
export function simulateTimerDualEffect({
  deadlineAt,
  startedAt,
  durationMins,
  remainingSecondsFromServer,
  nowMs,
}) {
  const afterIntervalInit = calculateTimeLeft({
    deadlineAt,
    startedAt,
    durationMins,
    remainingSeconds: remainingSecondsFromServer,
    nowMs,
  });

  const afterServerSnap =
    typeof remainingSecondsFromServer === "number"
      ? Math.max(0, remainingSecondsFromServer)
      : afterIntervalInit;

  return { afterIntervalInit, afterServerSnap };
}
