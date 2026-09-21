export const EXAM_ATTEMPT_STATUS_AWAITING_GRADING = "awaiting_grading";

export function isAwaitingGrading(attempt) {
  return attempt?.status === EXAM_ATTEMPT_STATUS_AWAITING_GRADING;
}

export function getGradedAttempts(attempts) {
  return attempts.filter((attempt) => !isAwaitingGrading(attempt));
}

export function pickHighestGradedAttempt(attempts) {
  const graded = getGradedAttempts(attempts);
  if (!graded.length) return null;

  return [...graded].sort(
    (a, b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0),
  )[0];
}

export function resolveGaugeAttempt(selectedAttempt, attempts) {
  if (selectedAttempt) return selectedAttempt;

  const highestGraded = pickHighestGradedAttempt(attempts);
  if (highestGraded) return highestGraded;

  if (!attempts.length) return null;

  return [...attempts].sort(
    (a, b) => (b.attempt_id || 0) - (a.attempt_id || 0),
  )[0];
}

export function isAttemptFailed(attempt) {
  if (!attempt || isAwaitingGrading(attempt)) return false;

  return attempt.status === "failed" || attempt.is_passed === false;
}

export function getAttemptStatusBadgeClass(attempt) {
  if (isAwaitingGrading(attempt)) return "badge-under-grading";
  if (isAttemptFailed(attempt)) return "badge-failed";

  return "badge-passed";
}

export const UNDER_GRADING_BADGE_STYLE = {
  backgroundColor: "#fef3c7",
  color: "#92400e",
};
