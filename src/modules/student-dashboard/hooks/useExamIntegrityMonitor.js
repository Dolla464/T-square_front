import { useEffect, useRef } from "react";
import { recordIntegrityEvents } from "../services/dashboardService";

const FLUSH_INTERVAL_MS = 5000;
const RESIZE_THRESHOLD = 0.7;
const BLUR_TAB_HIDDEN_WINDOW_MS = 1000;

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildMetadata(extra = {}) {
  return {
    inner_width: window.innerWidth,
    inner_height: window.innerHeight,
    visibility_state: document.visibilityState,
    ...extra,
  };
}

async function sendBatch(attemptId, events) {
  if (!attemptId || events.length === 0) {
    return true;
  }

  try {
    await recordIntegrityEvents(attemptId, events);
    return true;
  } catch {
    return false;
  }
}

export function useExamIntegrityMonitor({ attemptId, enabled }) {
  const bufferRef = useRef([]);
  const retryQueueRef = useRef([]);
  const baselineRef = useRef(null);
  const lastTabHiddenAtRef = useRef(null);
  const lastTabHiddenEventAtRef = useRef(0);
  const flushInFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled || !attemptId) {
      return undefined;
    }

    baselineRef.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    lastTabHiddenAtRef.current = null;
    lastTabHiddenEventAtRef.current = 0;
    bufferRef.current = [];
    retryQueueRef.current = [];

    const enqueue = (event) => {
      bufferRef.current.push(event);
    };

    const flush = async ({ immediate = false } = {}) => {
      if (flushInFlightRef.current) {
        return;
      }

      flushInFlightRef.current = true;

      try {
        const pendingRetry = [...retryQueueRef.current];
        if (pendingRetry.length > 0) {
          const retryOk = await sendBatch(attemptId, pendingRetry);
          if (retryOk) {
            retryQueueRef.current = [];
          }
        }

        if (bufferRef.current.length === 0) {
          return;
        }

        const batch = [...bufferRef.current];
        bufferRef.current = [];

        const ok = await sendBatch(attemptId, batch);
        if (!ok) {
          retryQueueRef.current = [...retryQueueRef.current, ...batch];
        }
      } finally {
        flushInFlightRef.current = false;
      }

      if (immediate) {
        // no-op placeholder for clarity at call sites
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastTabHiddenAtRef.current = Date.now();
        lastTabHiddenEventAtRef.current = Date.now();
        enqueue({
          event_id: createEventId(),
          type: "tab_hidden",
          client_at: new Date().toISOString(),
          metadata: buildMetadata(),
        });
      } else {
        const hiddenDurationSeconds =
          lastTabHiddenAtRef.current != null
            ? Math.max(0, Math.round((Date.now() - lastTabHiddenAtRef.current) / 1000))
            : null;

        enqueue({
          event_id: createEventId(),
          type: "tab_visible",
          client_at: new Date().toISOString(),
          metadata: buildMetadata(
            hiddenDurationSeconds != null
              ? { hidden_duration_seconds: hiddenDurationSeconds }
              : {},
          ),
        });

        lastTabHiddenAtRef.current = null;
      }

      flush({ immediate: true });
    };

    const handleBlur = () => {
      const sinceTabHidden = Date.now() - lastTabHiddenEventAtRef.current;
      if (sinceTabHidden >= 0 && sinceTabHidden < BLUR_TAB_HIDDEN_WINDOW_MS) {
        return;
      }

      enqueue({
        event_id: createEventId(),
        type: "window_blur",
        client_at: new Date().toISOString(),
        metadata: buildMetadata(),
      });
    };

    const handleResize = () => {
      const baseline = baselineRef.current;
      if (!baseline) {
        return;
      }

      const widthRatio = window.innerWidth / baseline.width;
      const heightRatio = window.innerHeight / baseline.height;

      if (widthRatio >= RESIZE_THRESHOLD && heightRatio >= RESIZE_THRESHOLD) {
        return;
      }

      enqueue({
        event_id: createEventId(),
        type: "window_resized",
        client_at: new Date().toISOString(),
        metadata: buildMetadata({
          baseline_width: baseline.width,
          baseline_height: baseline.height,
          width_ratio: Number(widthRatio.toFixed(3)),
          height_ratio: Number(heightRatio.toFixed(3)),
        }),
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("resize", handleResize);

    const intervalId = window.setInterval(() => {
      flush();
    }, FLUSH_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("resize", handleResize);
      window.clearInterval(intervalId);
      flush({ immediate: true });
    };
  }, [attemptId, enabled]);
}
