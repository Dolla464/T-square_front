/**
 * Quiz exam session persistence (client-only).
 * v2: navigation index + dirty drafts only. Legacy v1 stored full savedAnswers;
 * those are not promoted to dirty drafts on load (server baseline wins for answers).
 */

export const QUIZ_SESSION_VERSION = 2;

export function quizSessionStorageKey(quizId) {
  return `quiz_state_${quizId}`;
}

export function parseQuizSession(raw) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * @param {Record<string|number, unknown>} apiAnswers
 * @param {object|null} session
 * @param {number|string|null} attemptId
 */
export function mergeExamAnswersForResume({
  apiAnswers = {},
  session,
  attemptId,
}) {
  const base = normalizeAnswersMap(apiAnswers);
  const attemptKey = attemptId != null ? String(attemptId) : null;

  if (!session || attemptKey == null) {
    return { answers: base, savedIndex: 0 };
  }

  if (String(session.attemptId) !== attemptKey) {
    return { answers: base, savedIndex: 0 };
  }

  const savedIndex =
    typeof session.savedIndex === "number" && session.savedIndex >= 0
      ? session.savedIndex
      : 0;

  if (session.v === QUIZ_SESSION_VERSION && session.drafts) {
    const merged = { ...base };
    for (const [questionKey, draft] of Object.entries(session.drafts)) {
      if (!draft || draft.dirty !== true) {
        continue;
      }
      if (!Object.prototype.hasOwnProperty.call(draft, "value")) {
        continue;
      }
      merged[normalizeQuestionKey(questionKey)] = draft.value;
    }
    return { answers: merged, savedIndex };
  }

  // Legacy schema: restore question index only; ignore savedAnswers for hydration.
  return { answers: base, savedIndex };
}

export function buildQuizSessionPayload({
  attemptId,
  savedIndex,
  drafts,
}) {
  return {
    v: QUIZ_SESSION_VERSION,
    attemptId,
    savedIndex,
    drafts: drafts ?? {},
  };
}

export function writeQuizSession(quizId, payload) {
  if (!quizId) {
    return;
  }
  sessionStorage.setItem(
    quizSessionStorageKey(quizId),
    JSON.stringify(payload),
  );
}

export function readQuizSession(quizId) {
  if (!quizId) {
    return null;
  }
  return parseQuizSession(sessionStorage.getItem(quizSessionStorageKey(quizId)));
}

function normalizeQuestionKey(key) {
  const asNumber = Number(key);
  return Number.isNaN(asNumber) ? key : asNumber;
}

function normalizeAnswersMap(answers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return {};
  }

  const normalized = {};
  for (const [key, value] of Object.entries(answers)) {
    normalized[normalizeQuestionKey(key)] = value;
  }
  return normalized;
}
