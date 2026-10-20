/**
 * Optional client breadcrumbs for exam journey debugging.
 * Enabled only when VITE_EXAM_STUDENT_EXAM_LOG=true
 */

import { recordExamJourneyEvents } from "../services/dashboardService";

const ENABLED = import.meta.env.VITE_EXAM_STUDENT_EXAM_LOG === "true";

const ALLOWED_TYPES = new Set([
  "PAGE_MOUNT",
  "START_API_CALL",
  "START_API_FAIL",
  "NETWORK_ERROR",
  "SUBMIT_CLICK",
  "VISIBILITY_HIDDEN",
  "ERROR_BOUNDARY",
  "TIMER_EXPIRY_CHECK",
  "LEAVE_CONFIRMED",
  "LEAVE_DURING_INIT",
]);

const MAX_BATCH = 10;
const FLUSH_MS = 5000;
const MAX_EVENTS_PER_MINUTE = 30;

let queue = [];
let attemptId = null;
let flushTimer = null;
let eventsThisMinute = 0;
let minuteWindowStart = Date.now();

function resetMinuteWindowIfNeeded() {
  const now = Date.now();
  if (now - minuteWindowStart >= 60_000) {
    minuteWindowStart = now;
    eventsThisMinute = 0;
  }
}

function canEnqueue() {
  if (!ENABLED || !attemptId) {
    return false;
  }

  resetMinuteWindowIfNeeded();

  return eventsThisMinute < MAX_EVENTS_PER_MINUTE;
}

function scheduleFlush() {
  if (flushTimer !== null) {
    return;
  }

  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushExamJourneyEvents();
  }, FLUSH_MS);
}

export function examJourneyLogEnabled() {
  return ENABLED;
}

export function bindExamJourneyAttempt(id) {
  if (!ENABLED) {
    return;
  }

  attemptId = id ?? null;
}

export function clearExamJourneyAttempt() {
  attemptId = null;
  queue = [];
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

export function trackExamJourneyEvent(type, metadata = {}) {
  if (!ENABLED || !ALLOWED_TYPES.has(type) || !canEnqueue()) {
    return;
  }

  eventsThisMinute += 1;

  queue.push({
    event_id: crypto.randomUUID(),
    type,
    client_at: new Date().toISOString(),
    metadata: sanitizeMetadata(metadata),
  });

  if (queue.length >= MAX_BATCH) {
    flushExamJourneyEvents();
    return;
  }

  scheduleFlush();
}

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return undefined;
  }

  const out = {};
  let count = 0;

  for (const [key, value] of Object.entries(metadata)) {
    if (count >= 5) {
      break;
    }

    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
      continue;
    }

    const str = String(value).slice(0, 120);
    out[key.slice(0, 40)] = str;
    count += 1;
  }

  return Object.keys(out).length ? out : undefined;
}

export async function flushExamJourneyEvents() {
  if (!ENABLED || !attemptId || queue.length === 0) {
    return;
  }

  const batch = queue.splice(0, MAX_BATCH);

  try {
    await recordExamJourneyEvents(attemptId, batch);
  } catch {
    // Never disrupt the exam UI for logging failures.
  }
}
