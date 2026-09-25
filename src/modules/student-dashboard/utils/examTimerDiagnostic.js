/**
 * Passive exam timer runtime diagnostics.
 * Enabled only when VITE_EXAM_TIMER_DIAGNOSTIC=true
 * Does not modify timer behavior.
 */

const ENABLED = import.meta.env.VITE_EXAM_TIMER_DIAGNOSTIC === "true";

function parseDurationMinutes(duration) {
  const parsed = parseFloat(duration);
  return Number.isFinite(parsed) ? parsed : null;
}

function expectedMaxSeconds(durationMinutes) {
  if (!durationMinutes || durationMinutes <= 0) {
    return null;
  }
  return durationMinutes * 60;
}

function isSuspiciousSeconds(value, durationMinutes) {
  const max = expectedMaxSeconds(durationMinutes);
  if (max === null || typeof value !== "number" || Number.isNaN(value)) {
    return false;
  }
  return value > max;
}

export function examTimerDiagnosticEnabled() {
  return ENABLED;
}

export function examTimerDiag(event, payload) {
  if (!ENABLED) {
    return;
  }

  console.info(`[EXAM_TIMER_DIAGNOSTIC][${event}]`, payload);
}

export function observeEndTimeCalculation({
  deadlineAt,
  startedAt,
  durationMins,
  remainingSeconds,
  nowMs = Date.now(),
}) {
  let source = "remaining_seconds";
  let endTimeMs = null;

  if (deadlineAt) {
    const deadlineMs = new Date(deadlineAt).getTime();
    if (!Number.isNaN(deadlineMs)) {
      endTimeMs = deadlineMs;
      source = "deadline_at";
    }
  }

  if (endTimeMs === null && startedAt && durationMins > 0) {
    const startMs = new Date(startedAt).getTime();
    if (!Number.isNaN(startMs)) {
      endTimeMs = startMs + durationMins * 60 * 1000;
      source = "started_at_plus_duration";
    }
  }

  if (endTimeMs === null && typeof remainingSeconds === "number") {
    source = "remaining_seconds";
  }

  return {
    source,
    calculated_end_time_ms: endTimeMs,
    calculated_end_time_iso:
      endTimeMs === null ? null : new Date(endTimeMs).toISOString(),
    now_ms: nowMs,
    deadline_at: deadlineAt ?? null,
    started_at: startedAt ?? null,
    duration_minutes: durationMins ?? null,
    remainingSeconds: remainingSeconds ?? null,
  };
}

export function buildTimerSanityFlags({
  timeLeft,
  remainingSeconds,
  durationMinutes,
  deadlineAt,
  startedAt,
}) {
  const expectedMax = expectedMaxSeconds(durationMinutes);

  return {
    expected_max_seconds: expectedMax,
    remaining_exceeds_expected: isSuspiciousSeconds(remainingSeconds, durationMinutes),
    time_left_exceeds_expected: isSuspiciousSeconds(timeLeft, durationMinutes),
    deadline_exceeds_expected:
      expectedMax !== null &&
      deadlineAt &&
      startedAt &&
      (() => {
        const startMs = new Date(startedAt).getTime();
        const deadlineMs = new Date(deadlineAt).getTime();
        if (Number.isNaN(startMs) || Number.isNaN(deadlineMs)) {
          return false;
        }
        const deltaSeconds = (deadlineMs - startMs) / 1000;
        return Math.abs(deltaSeconds - expectedMax) > 1;
      })(),
  };
}

export function logStartResponse(data) {
  if (!ENABLED || !data) {
    return;
  }

  const durationMinutes = parseDurationMinutes(data.duration);
  examTimerDiag("START_RESPONSE", {
    attempt_id: data.attempt_id ?? null,
    duration: data.duration ?? null,
    duration_minutes: durationMinutes,
    started_at: data.started_at ?? null,
    deadline_at: data.deadline_at ?? null,
    remaining_seconds: data.remaining_seconds ?? null,
    server_time: data.server_time ?? null,
    status: data.status ?? null,
    is_timed_out: data.is_timed_out ?? null,
    ...buildTimerSanityFlags({
      timeLeft: data.remaining_seconds,
      remainingSeconds: data.remaining_seconds,
      durationMinutes,
      deadlineAt: data.deadline_at,
      startedAt: data.started_at,
    }),
  });
}

export function logTimeStatusResponse(data) {
  if (!ENABLED || !data) {
    return;
  }

  const durationMinutes = parseDurationMinutes(data.duration);
  examTimerDiag("TIME_STATUS_RESPONSE", {
    attempt_id: data.attempt_id ?? null,
    duration: data.duration ?? null,
    duration_minutes: durationMinutes,
    started_at: data.started_at ?? null,
    deadline_at: data.deadline_at ?? null,
    remaining_seconds: data.remaining_seconds ?? null,
    server_time: data.server_time ?? null,
    status: data.status ?? null,
    is_timed_out: data.is_timed_out ?? null,
    ...buildTimerSanityFlags({
      timeLeft: data.remaining_seconds,
      remainingSeconds: data.remaining_seconds,
      durationMinutes,
      deadlineAt: data.deadline_at,
      startedAt: data.started_at,
    }),
  });
}

export function logTimerInput(props) {
  if (!ENABLED) {
    return;
  }

  const durationMinutes = parseDurationMinutes(props.durationMins);
  examTimerDiag("TIMER_INPUT", {
    attempt_id: props.attemptId ?? null,
    duration: props.durationMins ?? null,
    duration_minutes: durationMinutes,
    started_at: props.startedAt ?? null,
    deadline_at: props.deadlineAt ?? null,
    remainingSeconds: props.remainingSeconds ?? null,
    status: props.status ?? null,
    is_timed_out: props.isTimedOut ?? null,
    ...buildTimerSanityFlags({
      timeLeft: props.remainingSeconds,
      remainingSeconds: props.remainingSeconds,
      durationMinutes,
      deadlineAt: props.deadlineAt,
      startedAt: props.startedAt,
    }),
  });
}

export function logEndTime(observation) {
  if (!ENABLED) {
    return;
  }

  examTimerDiag("END_TIME", observation);
}

export function logTimeLeft({
  source,
  timeLeft,
  remainingSeconds,
  deadlineAt,
  startedAt,
  durationMins,
  attemptId,
  force = false,
}) {
  if (!ENABLED) {
    return;
  }

  const durationMinutes = parseDurationMinutes(durationMins);
  const suspicious = isSuspiciousSeconds(timeLeft, durationMinutes)
    || isSuspiciousSeconds(remainingSeconds, durationMinutes);

  if (!force && !suspicious && source === "deadline_countdown") {
    return;
  }

  examTimerDiag("TIME_LEFT", {
    source,
    attempt_id: attemptId ?? null,
    timeLeft,
    timeLeft_integer: typeof timeLeft === "number" ? Math.trunc(timeLeft) : null,
    timeLeft_floor: typeof timeLeft === "number" ? Math.floor(timeLeft) : null,
    timeLeft_ceil: typeof timeLeft === "number" ? Math.ceil(timeLeft) : null,
    remainingSeconds: remainingSeconds ?? null,
    deadline_at: deadlineAt ?? null,
    started_at: startedAt ?? null,
    duration_minutes: durationMinutes,
    ...buildTimerSanityFlags({
      timeLeft,
      remainingSeconds,
      durationMinutes,
      deadlineAt,
      startedAt,
    }),
  });
}

export function logTimerRender({ timeLeft, attemptId }) {
  if (!ENABLED || timeLeft === null || timeLeft === undefined) {
    return;
  }

  examTimerDiag("RENDER", {
    attempt_id: attemptId ?? null,
    timeLeft,
    display_minutes: Math.floor(timeLeft / 60),
    display_seconds: timeLeft % 60,
  });
}
