import React, { useState, useEffect, useRef } from "react";
import {
  logEndTime,
  logTimeLeft,
  logTimerInput,
  logTimerRender,
  observeEndTimeCalculation,
} from "../../utils/examTimerDiagnostic";
import {
  calculateTimeLeft,
  hasUsableTimerInputs,
} from "../../utils/examTimerUtils";

const QuizTimer = React.memo(function QuizTimer({
  attemptId,
  status,
  isTimedOut,
  deadlineAt,
  startedAt,
  durationMins,
  remainingSeconds,
  onExpirySuspected,
  onSync,
  disabled,
}) {
  const [timeLeft, setTimeLeft] = useState(null);
  const onExpirySuspectedRef = useRef(onExpirySuspected);
  const hasLoggedRenderRef = useRef(false);
  const prevRemainingSecondsRef = useRef(remainingSeconds);
  const initialSuspectSentRef = useRef(false);
  const countdownSuspectSentRef = useRef(false);
  onExpirySuspectedRef.current = onExpirySuspected;

  useEffect(() => {
    initialSuspectSentRef.current = false;
    countdownSuspectSentRef.current = false;
  }, [attemptId]);

  useEffect(() => {
    logTimerInput({
      attemptId,
      status,
      isTimedOut,
      deadlineAt,
      startedAt,
      durationMins,
      remainingSeconds,
    });
  }, [
    attemptId,
    status,
    isTimedOut,
    deadlineAt,
    startedAt,
    durationMins,
    remainingSeconds,
  ]);

  useEffect(() => {
    if (disabled) return;

    if (
      !hasUsableTimerInputs({
        deadlineAt,
        startedAt,
        durationMins,
        remainingSeconds,
      })
    ) {
      return;
    }

    const initialTime = calculateTimeLeft({
      deadlineAt,
      startedAt,
      durationMins,
      remainingSeconds,
    });
    logEndTime(
      observeEndTimeCalculation({
        deadlineAt,
        startedAt,
        durationMins,
        remainingSeconds,
      }),
    );
    logTimeLeft({
      source: "initialization",
      timeLeft: initialTime,
      remainingSeconds,
      deadlineAt,
      startedAt,
      durationMins,
      attemptId,
      force: true,
    });
    setTimeLeft(initialTime);

    if (initialTime !== null && initialTime <= 0) {
      if (!initialSuspectSentRef.current) {
        initialSuspectSentRef.current = true;
        void onExpirySuspectedRef.current?.({ source: "initial" });
      }
      return undefined;
    }

    initialSuspectSentRef.current = false;
    countdownSuspectSentRef.current = false;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft({
        deadlineAt,
        startedAt,
        durationMins,
        remainingSeconds,
      });
      logTimeLeft({
        source: "deadline_countdown",
        timeLeft: remaining,
        remainingSeconds,
        deadlineAt,
        startedAt,
        durationMins,
        attemptId,
      });
      setTimeLeft(remaining);
      if (remaining !== null && remaining <= 0 && !countdownSuspectSentRef.current) {
        countdownSuspectSentRef.current = true;
        clearInterval(interval);
        void onExpirySuspectedRef.current?.({ source: "countdown" });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [deadlineAt, startedAt, durationMins, disabled, remainingSeconds, attemptId]);

  useEffect(() => {
    if (typeof remainingSeconds !== "number" || disabled) {
      return;
    }

    if (prevRemainingSecondsRef.current === remainingSeconds) {
      return;
    }

    prevRemainingSecondsRef.current = remainingSeconds;

    const snapped = Math.max(0, remainingSeconds);
    logTimeLeft({
      source: "remaining_seconds_sync",
      timeLeft: snapped,
      remainingSeconds,
      deadlineAt,
      startedAt,
      durationMins,
      attemptId,
      force: true,
    });
    setTimeLeft(snapped);
  }, [remainingSeconds, deadlineAt, startedAt, durationMins, attemptId, disabled]);

  useEffect(() => {
    if (!onSync || disabled) return undefined;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        onSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    const interval = setInterval(onSync, 60000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [onSync, disabled]);

  useEffect(() => {
    if (timeLeft === null) {
      return;
    }

    const shouldLogRender =
      !hasLoggedRenderRef.current ||
      (typeof durationMins === "number" &&
        durationMins > 0 &&
        timeLeft > durationMins * 60);

    if (shouldLogRender) {
      logTimerRender({ timeLeft, attemptId });
      hasLoggedRenderRef.current = true;
    }
  }, [timeLeft, durationMins, attemptId]);

  if (timeLeft === null) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`quiz-timer-badge ${timeLeft < 60 ? "timer-warning" : ""}`}>
      <i className="bi bi-clock me-1"></i>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
});

export default QuizTimer;
