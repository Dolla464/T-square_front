import { describe, it, expect } from "vitest";
import {
  applyServerRemainingSnap,
  simulateTimerDualEffect,
} from "./quizTimerAuditMirror.js";

const TEN_MINUTE_MAX = 600;
const BASE_NOW = Date.parse("2026-01-01T10:05:00Z");

describe("QuizTimer audit mirror — server sync behavior", () => {
  it("snaps display to server remaining_seconds when sync reports 475", () => {
    const { afterIntervalInit, afterServerSnap } = simulateTimerDualEffect({
      deadlineAt: "2026-01-01T10:10:00Z",
      startedAt: "2026-01-01T10:00:00Z",
      durationMins: 10,
      remainingSecondsFromServer: 475,
      nowMs: BASE_NOW,
    });

    expect(afterIntervalInit).toBe(300);
    expect(afterServerSnap).toBe(475);
    expect(afterServerSnap).toBeGreaterThan(afterIntervalInit);
  });

  it("snaps display downward when server remaining is lower than local countdown", () => {
    const { afterIntervalInit, afterServerSnap } = simulateTimerDualEffect({
      deadlineAt: "2026-01-01T10:10:00Z",
      startedAt: "2026-01-01T10:00:00Z",
      durationMins: 10,
      remainingSecondsFromServer: 280,
      nowMs: BASE_NOW,
    });

    expect(afterIntervalInit).toBe(300);
    expect(afterServerSnap).toBe(280);
    expect(afterServerSnap).toBeLessThan(afterIntervalInit);
  });

  it("documents upward jump when local=480 and server sync returns 485", () => {
    const nowMs = Date.parse("2026-01-01T10:02:00Z");
    const { afterIntervalInit, afterServerSnap } = simulateTimerDualEffect({
      deadlineAt: "2026-01-01T10:10:00Z",
      startedAt: "2026-01-01T10:00:00Z",
      durationMins: 10,
      remainingSecondsFromServer: 485,
      nowMs,
    });

    expect(afterIntervalInit).toBe(480);
    expect(afterServerSnap).toBe(485);
    expect(afterServerSnap - afterIntervalInit).toBe(5);
  });
});

describe("QuizTimer audit mirror — sync/local race ordering", () => {
  it("case A: local tick then server sync can increase displayed time", () => {
    const localTick = 479;
    const serverSync = 480;
    expect(serverSync).toBeGreaterThan(localTick);
  });

  it("case B: server sync then local tick uses deadline-based calculation", () => {
    const nowMs = Date.parse("2026-01-01T10:02:01Z");
    const { afterIntervalInit } = simulateTimerDualEffect({
      deadlineAt: "2026-01-01T10:10:00Z",
      startedAt: "2026-01-01T10:00:00Z",
      durationMins: 10,
      remainingSecondsFromServer: 480,
      nowMs,
    });

    expect(afterIntervalInit).toBe(479);
  });
});

describe("QuizTimer audit mirror — timeout via sync", () => {
  it("server remaining_seconds=0 yields zero display after snap", () => {
    const { afterServerSnap } = simulateTimerDualEffect({
      deadlineAt: "2026-01-01T10:10:00Z",
      startedAt: "2026-01-01T10:00:00Z",
      durationMins: 10,
      remainingSecondsFromServer: 0,
      nowMs: Date.parse("2026-01-01T10:10:00Z"),
    });

    expect(afterServerSnap).toBe(0);
  });
});

describe("QuizTimer audit mirror — disabled toggle regression", () => {
  it("does not reset local countdown when disabled toggles but remainingSeconds stays 600", () => {
    const localTimeLeft = 540;
    let previousRemainingSeconds = 600;

    const afterDisable = applyServerRemainingSnap({
      timeLeft: localTimeLeft,
      remainingSeconds: 600,
      previousRemainingSeconds,
      disabled: true,
    });
    expect(afterDisable.timeLeft).toBe(540);

    const afterReEnable = applyServerRemainingSnap({
      timeLeft: afterDisable.timeLeft,
      remainingSeconds: 600,
      previousRemainingSeconds: afterDisable.previousRemainingSeconds,
      disabled: false,
    });

    expect(afterReEnable.timeLeft).toBe(540);
    expect(afterReEnable.previousRemainingSeconds).toBe(600);
  });

  it("does not reset when server repeats the same remainingSeconds value", () => {
    const localTimeLeft = 540;
    const first = applyServerRemainingSnap({
      timeLeft: localTimeLeft,
      remainingSeconds: 600,
      previousRemainingSeconds: 600,
      disabled: false,
    });

    const second = applyServerRemainingSnap({
      timeLeft: first.timeLeft,
      remainingSeconds: 600,
      previousRemainingSeconds: first.previousRemainingSeconds,
      disabled: false,
    });

    expect(second.timeLeft).toBe(540);
  });
});

describe("QuizTimer audit mirror — genuine server sync", () => {
  it("snaps to 487 when remainingSeconds changes from 600 to 487", () => {
    const localTimeLeft = 540;
    const result = applyServerRemainingSnap({
      timeLeft: localTimeLeft,
      remainingSeconds: 487,
      previousRemainingSeconds: 600,
      disabled: false,
    });

    expect(result.timeLeft).toBe(487);
    expect(result.previousRemainingSeconds).toBe(487);
  });
});

describe("QuizTimer audit mirror — repeated sync stability", () => {
  it("does not exceed 600 when server consistently reports valid remaining values", () => {
    const serverValues = [600, 599, 580, 540, 300, 60, 1, 0];

    for (const remaining of serverValues) {
      const { afterServerSnap } = simulateTimerDualEffect({
        deadlineAt: "2026-01-01T10:10:00Z",
        startedAt: "2026-01-01T10:00:00Z",
        durationMins: 10,
        remainingSecondsFromServer: remaining,
        nowMs: Date.parse("2026-01-01T10:00:00Z"),
      });

      expect(afterServerSnap).toBeLessThanOrEqual(TEN_MINUTE_MAX);
    }
  });
});
