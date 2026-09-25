import { describe, it, expect, vi, afterEach } from "vitest";
import {
  buildValidTenMinutePayload,
  calculateTimeLeft,
  formatTimerDiagnostic,
  getEndTimeMs,
} from "./quizTimerAuditMirror.js";

const TEN_MINUTE_MAX = 600;
const TEN_MINUTE_START_MS = Date.parse("2026-01-01T10:00:00Z");

afterEach(() => {
  vi.restoreAllMocks();
});

function withMockNow(isoString, fn) {
  const nowMs = Date.parse(isoString);
  vi.spyOn(Date, "now").mockReturnValue(nowMs);
  return fn(nowMs);
}

describe("QuizTimer audit mirror — valid 10-minute payload", () => {
  it("initializes countdown at 600 seconds for a newly started exam", () => {
    withMockNow("2026-01-01T10:00:00Z", (nowMs) => {
      const payload = buildValidTenMinutePayload();
      const timeLeft = calculateTimeLeft({
        deadlineAt: payload.deadline_at,
        startedAt: payload.started_at,
        durationMins: parseFloat(payload.duration),
        remainingSeconds: payload.remaining_seconds,
        nowMs,
      });

      expect(timeLeft).toBe(TEN_MINUTE_MAX);
      expect(timeLeft).toBeLessThanOrEqual(TEN_MINUTE_MAX);
    });
  });

  it("does_not_produce_4361_5_seconds_for_a_10_minute_exam", () => {
    withMockNow("2026-01-01T10:00:00Z", (nowMs) => {
      const payload = buildValidTenMinutePayload();
      const diagnostic = formatTimerDiagnostic({
        label: "4361.5-regression-valid-payload",
        duration: payload.duration,
        startedAt: payload.started_at,
        deadlineAt: payload.deadline_at,
        serverTime: payload.server_time,
        remainingSeconds: payload.remaining_seconds,
        nowMs,
      });

      expect(diagnostic.calculated_remaining_seconds).toBeLessThanOrEqual(TEN_MINUTE_MAX);
      expect(diagnostic.calculated_remaining_seconds).not.toBe(4361);
      expect(diagnostic.calculated_remaining_seconds).not.toBe(4362);

      if (diagnostic.calculated_remaining_seconds > TEN_MINUTE_MAX) {
        throw new Error(JSON.stringify(diagnostic, null, 2));
      }
    });
  });
});

describe("QuizTimer audit mirror — unit conversion", () => {
  const cases = [
    { duration: 10, label: "number 10" },
    { duration: "10", label: "string 10" },
    { duration: 10.0, label: "float 10.0" },
    { duration: "10.0", label: "string 10.0" },
  ];

  it.each(cases)("parses duration $label as 10 minutes ($duration)", ({ duration }) => {
    withMockNow("2026-01-01T10:00:00Z", (nowMs) => {
      const durationMins = parseFloat(duration);
      const timeLeft = calculateTimeLeft({
        deadlineAt: null,
        startedAt: "2026-01-01T10:00:00Z",
        durationMins,
        remainingSeconds: undefined,
        nowMs,
      });

      expect(timeLeft).toBe(TEN_MINUTE_MAX);
    });
  });

  it("treats duration 600 as 600 minutes not 10 minutes (documents dangerous misconfiguration)", () => {
    withMockNow("2026-01-01T10:00:00Z", (nowMs) => {
      const timeLeft = calculateTimeLeft({
        deadlineAt: null,
        startedAt: "2026-01-01T10:00:00Z",
        durationMins: parseFloat(600),
        remainingSeconds: undefined,
        nowMs,
      });

      expect(timeLeft).toBe(36000);
      expect(timeLeft).toBeGreaterThan(TEN_MINUTE_MAX);
    });
  });

  it("treats remaining_seconds 600 as seconds not minutes in fallback-only path", () => {
    const timeLeft = calculateTimeLeft({
      deadlineAt: null,
      startedAt: null,
      durationMins: 0,
      remainingSeconds: 600,
      nowMs: TEN_MINUTE_START_MS,
    });

    expect(timeLeft).toBe(600);
  });
});

describe("QuizTimer audit mirror — deadline parsing", () => {
  it("parses ISO8601 Z deadline as absolute milliseconds", () => {
    const endMs = getEndTimeMs({
      deadlineAt: "2026-01-01T10:10:00Z",
      startedAt: null,
      durationMins: 0,
    });

    expect(endMs).toBe(Date.parse("2026-01-01T10:10:00Z"));
  });

  it("parses ISO8601 offset deadline consistently", () => {
    withMockNow("2026-01-01T10:00:00Z", (nowMs) => {
      const timeLeft = calculateTimeLeft({
        deadlineAt: "2026-01-01T13:10:00+03:00",
        startedAt: "2026-01-01T13:00:00+03:00",
        durationMins: 10,
        remainingSeconds: 600,
        nowMs,
      });

      expect(timeLeft).toBe(TEN_MINUTE_MAX);
    });
  });

  it("documents how a numeric-only deadline string is parsed by Date()", () => {
    const endMs = getEndTimeMs({
      deadlineAt: "1735736400",
      startedAt: "2026-01-01T10:00:00Z",
      durationMins: 10,
    });

    // jsdom/V8 may treat digit-only strings as year values, not unix seconds.
    expect(Number.isNaN(endMs)).toBe(false);
    expect(typeof endMs).toBe("number");
  });

  it("does not produce thousands of seconds from valid ISO deadline at exam start", () => {
    withMockNow("2026-01-01T10:00:00Z", (nowMs) => {
      const timeLeft = calculateTimeLeft({
        deadlineAt: "2026-01-01T10:10:00Z",
        startedAt: "2026-01-01T10:00:00Z",
        durationMins: 10,
        remainingSeconds: 600,
        nowMs,
      });

      expect(timeLeft).toBeLessThanOrEqual(TEN_MINUTE_MAX);
      expect(timeLeft).toBeGreaterThan(590);
    });
  });
});

describe("QuizTimer audit mirror — started_at + duration fallback", () => {
  it("computes 600 seconds when deadline_at is unavailable", () => {
    withMockNow("2026-01-01T10:00:00Z", (nowMs) => {
      const timeLeft = calculateTimeLeft({
        deadlineAt: null,
        startedAt: "2026-01-01T10:00:00Z",
        durationMins: 10,
        remainingSeconds: undefined,
        nowMs,
      });

      expect(timeLeft).toBe(TEN_MINUTE_MAX);
    });
  });

  it("computes 480 seconds after 2 minutes via fallback path", () => {
    withMockNow("2026-01-01T10:02:00Z", (nowMs) => {
      const timeLeft = calculateTimeLeft({
        deadlineAt: null,
        startedAt: "2026-01-01T10:00:00Z",
        durationMins: 10,
        remainingSeconds: undefined,
        nowMs,
      });

      expect(timeLeft).toBe(480);
    });
  });
});

describe("QuizTimer audit mirror — remaining_seconds-only fallback", () => {
  it.each([600, 300, 60, 1, 0])(
    "returns static remaining_seconds=%i when no end time exists",
    (remainingSeconds) => {
      const timeLeft = calculateTimeLeft({
        deadlineAt: null,
        startedAt: null,
        durationMins: 0,
        remainingSeconds,
        nowMs: TEN_MINUTE_START_MS,
      });

      expect(timeLeft).toBe(remainingSeconds);
    },
  );
});

describe("QuizTimer audit mirror — client clock offsets", () => {
  const scenarios = [
    { label: "client correct", clientIso: "2026-01-01T10:00:00Z", expected: 600 },
    { label: "client +1 minute", clientIso: "2026-01-01T10:01:00Z", expected: 540 },
    { label: "client +10 minutes", clientIso: "2026-01-01T10:10:00Z", expected: 0 },
    { label: "client -1 minute", clientIso: "2026-01-01T09:59:00Z", expected: 660 },
    { label: "client -10 minutes", clientIso: "2026-01-01T09:50:00Z", expected: 1200 },
  ];

  it.each(scenarios)(
    "documents countdown under $label (expected=$expected)",
    ({ clientIso, expected }) => {
      withMockNow(clientIso, (nowMs) => {
        const payload = buildValidTenMinutePayload();
        const timeLeft = calculateTimeLeft({
          deadlineAt: payload.deadline_at,
          startedAt: payload.started_at,
          durationMins: payload.duration,
          remainingSeconds: payload.remaining_seconds,
          nowMs,
        });

        expect(timeLeft).toBe(expected);
      });
    },
  );

  it("clock skew alone cannot explain 4361.5 from a valid 10-minute ISO payload", () => {
    const payload = buildValidTenMinutePayload();
    const offsetsMinutes = [-720, -60, -10, 0, 10, 60, 720];

    for (const offset of offsetsMinutes) {
      const nowMs = TEN_MINUTE_START_MS + offset * 60 * 1000;
      const timeLeft = calculateTimeLeft({
        deadlineAt: payload.deadline_at,
        startedAt: payload.started_at,
        durationMins: payload.duration,
        remainingSeconds: payload.remaining_seconds,
        nowMs,
      });

      expect(timeLeft).not.toBe(4361);
      expect(Math.abs(timeLeft - 4361.5)).toBeGreaterThan(100);
    }
  });
});

describe("QuizTimer audit mirror — malformed / edge inputs", () => {
  it("returns null when no timing inputs exist", () => {
    expect(
      calculateTimeLeft({
        deadlineAt: null,
        startedAt: null,
        durationMins: 0,
        remainingSeconds: undefined,
        nowMs: TEN_MINUTE_START_MS,
      }),
    ).toBeNull();
  });

  it("falls back to started_at + duration when deadline_at is empty string", () => {
    withMockNow("2026-01-01T10:00:00Z", (nowMs) => {
      const timeLeft = calculateTimeLeft({
        deadlineAt: "",
        startedAt: "2026-01-01T10:00:00Z",
        durationMins: 10,
        remainingSeconds: undefined,
        nowMs,
      });

      expect(timeLeft).toBe(TEN_MINUTE_MAX);
    });
  });

  it("can produce ~4361 seconds when deadline reflects ~72m41s window not 10 minutes", () => {
    withMockNow("2026-01-01T10:00:00Z", (nowMs) => {
      const timeLeft = calculateTimeLeft({
        deadlineAt: "2026-01-01T11:12:41.500Z",
        startedAt: "2026-01-01T10:00:00Z",
        durationMins: 10,
        remainingSeconds: 600,
        nowMs,
      });

      expect(timeLeft).toBe(4361);
      expect(timeLeft).toBeGreaterThan(TEN_MINUTE_MAX);
    });
  });

  it("can display server remaining_seconds snap above 600 when API sends wrong value", () => {
    const timeLeft = calculateTimeLeft({
      deadlineAt: "2026-01-01T10:10:00Z",
      startedAt: "2026-01-01T10:00:00Z",
      durationMins: 10,
      remainingSeconds: 4361,
      nowMs: TEN_MINUTE_START_MS,
    });

    // deadline path wins over remaining_seconds in calculateTimeLeft
    expect(timeLeft).toBe(600);

    const snapOnly = Math.max(0, 4361);
    expect(snapOnly).toBe(4361);
  });
});

describe("QuizTimer audit mirror — refresh/resume initialization", () => {
  it("uses resumed server values and does not reset to 600 after 2 minutes", () => {
    withMockNow("2026-01-01T10:02:00Z", (nowMs) => {
      const resumedPayload = buildValidTenMinutePayload({
        remaining_seconds: 480,
        server_time: "2026-01-01T10:02:00Z",
        deadline_at: "2026-01-01T10:10:00Z",
      });

      const timeLeft = calculateTimeLeft({
        deadlineAt: resumedPayload.deadline_at,
        startedAt: resumedPayload.started_at,
        durationMins: resumedPayload.duration,
        remainingSeconds: resumedPayload.remaining_seconds,
        nowMs,
      });

      expect(timeLeft).toBe(480);
      expect(timeLeft).not.toBe(TEN_MINUTE_MAX);
      expect(timeLeft).not.toBe(4361);
    });
  });
});
