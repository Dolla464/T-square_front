/**
 * Pure timer helpers shared by QuizExamPage and tests.
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

export function calculateTimeLeft({
  deadlineAt,
  startedAt,
  durationMins,
  remainingSeconds,
  nowMs = Date.now(),
}) {
  const endTime = getEndTimeMs({ deadlineAt, startedAt, durationMins });

  if (endTime) {
    const difference = endTime - nowMs;
    return difference <= 0 ? 0 : Math.floor(difference / 1000);
  }

  if (typeof remainingSeconds === "number" && !Number.isNaN(remainingSeconds)) {
    return Math.max(0, remainingSeconds);
  }

  return null;
}

export function hasUsableTimerInputs({
  deadlineAt,
  startedAt,
  durationMins,
  remainingSeconds,
}) {
  if (getEndTimeMs({ deadlineAt, startedAt, durationMins }) !== null) {
    return true;
  }

  return typeof remainingSeconds === "number" && !Number.isNaN(remainingSeconds);
}

/**
 * @returns {'unknown'|'ongoing'|'expired'|'closed_with_results'|'closed'}
 */
export function getServerExpiryAction(data) {
  if (!data || typeof data !== "object") {
    return "unknown";
  }

  if (data.status && data.status !== "ongoing") {
    return data.results ? "closed_with_results" : "closed";
  }

  if (data.is_timed_out === true) {
    return "expired";
  }

  if (typeof data.remaining_seconds === "number" && data.remaining_seconds <= 0) {
    return "expired";
  }

  return "ongoing";
}
