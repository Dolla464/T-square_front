import { render, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import QuizTimer from "../QuizTimer";

describe("QuizTimer safeguards", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not auto-submit on initial zero; requests server expiry check instead", () => {
    const onExpirySuspected = vi.fn();

    render(
      <QuizTimer
        attemptId={1478}
        status="ongoing"
        isTimedOut={false}
        deadlineAt="2020-01-01T00:10:00Z"
        startedAt="2020-01-01T00:00:00Z"
        durationMins={10}
        remainingSeconds={600}
        onExpirySuspected={onExpirySuspected}
        onSync={vi.fn()}
        disabled={false}
      />,
    );

    expect(onExpirySuspected).toHaveBeenCalledTimes(1);
    expect(onExpirySuspected).toHaveBeenCalledWith({ source: "initial" });
  });

  it("ignores missing timer inputs without calling expiry check", () => {
    const onExpirySuspected = vi.fn();

    render(
      <QuizTimer
        attemptId={1478}
        status="ongoing"
        isTimedOut={false}
        deadlineAt={null}
        startedAt={null}
        durationMins={0}
        remainingSeconds={undefined}
        onExpirySuspected={onExpirySuspected}
        onSync={vi.fn()}
        disabled={false}
      />,
    );

    expect(onExpirySuspected).not.toHaveBeenCalled();
  });

  it("requests expiry check when countdown reaches zero", () => {
    const onExpirySuspected = vi.fn();
    vi.setSystemTime(Date.parse("2026-01-01T09:59:30Z"));

    render(
      <QuizTimer
        attemptId={1478}
        status="ongoing"
        isTimedOut={false}
        deadlineAt="2026-01-01T10:00:00Z"
        startedAt="2026-01-01T09:50:00Z"
        durationMins={10}
        remainingSeconds={30}
        onExpirySuspected={onExpirySuspected}
        onSync={vi.fn()}
        disabled={false}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(31000);
    });

    expect(onExpirySuspected).toHaveBeenCalledWith({ source: "countdown" });
  });
});
