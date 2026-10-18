import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  getGroupAttendanceCardsBatchStatus,
  postGroupAttendanceCardsBatch,
} from "../../../services/learningGroupServices";
import { BULK_CARD_MODES } from "../bulkCardModes";

/** UI states for bulk issuance (uncertain is client-only). */
export const BULK_UI_STATES = {
  IDLE: "idle",
  RUNNING_BATCH: "running_batch",
  UNCERTAIN_BATCH: "uncertain_batch",
  REVIEW: "review",
  PRINT: "print",
  CLEARED: "cleared",
};

function modeNeedsReissueConfirm(mode, preview) {
  if (mode === BULK_CARD_MODES.REISSUE_ACTIVE_ONLY) {
    return true;
  }
  if (mode === BULK_CARD_MODES.ISSUE_ALL) {
    return (preview?.counts?.with_active_card ?? 0) > 0;
  }
  return false;
}

function buildInitialCursor(snapshotCount, batchMax) {
  if (!snapshotCount) {
    return { from_sequence: 0, to_sequence: -1 };
  }
  return {
    from_sequence: 0,
    to_sequence: Math.min(batchMax - 1, snapshotCount - 1),
  };
}

function mergeTokenMap(prev, students, forGroupId, activeGroupId) {
  if (forGroupId !== activeGroupId) {
    return prev;
  }
  let changed = false;
  const next = new Map(prev);
  students.forEach((row) => {
    if (row.plain_text_token && row.student_id) {
      next.set(row.student_id, row.plain_text_token);
      changed = true;
    }
  });
  return changed ? next : prev;
}

/**
 * In-memory token map only — never persisted to storage.
 */
export function useGroupAttendanceCardBulk(groupId) {
  const [uiState, setUiState] = useState(BULK_UI_STATES.IDLE);
  const [operationMeta, setOperationMeta] = useState(null);
  const [batchMeta, setBatchMeta] = useState(null);
  const [studentOutcomes, setStudentOutcomes] = useState([]);
  const [lastError, setLastError] = useState(null);
  const [tokensByStudentId, setTokensByStudentId] = useState(() => new Map());

  const clientOperationIdRef = useRef(null);
  const executingRef = useRef(false);
  const groupIdRef = useRef(groupId);

  useLayoutEffect(() => {
    groupIdRef.current = groupId;
  }, [groupId]);

  const clearTokens = useCallback(() => {
    setTokensByStudentId(new Map());
  }, []);

  const resetOperation = useCallback(() => {
    clientOperationIdRef.current = null;
    executingRef.current = false;
    clearTokens();
    setOperationMeta(null);
    setBatchMeta(null);
    setStudentOutcomes([]);
    setLastError(null);
    setUiState(BULK_UI_STATES.CLEARED);
  }, [clearTokens]);

  useEffect(() => {
    // Reset in-memory bulk state when the admin selects a different group.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on groupId change
    resetOperation();
  }, [groupId, resetOperation]);

  const beginNewOperation = useCallback(() => {
    clientOperationIdRef.current = null;
    setOperationMeta(null);
    setBatchMeta(null);
    setStudentOutcomes([]);
    setLastError(null);
  }, []);

  const applyBatchStudents = useCallback((students, forGroupId) => {
    if (!Array.isArray(students) || forGroupId !== groupIdRef.current) {
      return;
    }
    setStudentOutcomes((prev) => {
      const bySeq = new Map(prev.map((row) => [row.sequence, row]));
      students.forEach((row) => {
        bySeq.set(row.sequence, row);
      });
      return Array.from(bySeq.values()).sort((a, b) => a.sequence - b.sequence);
    });
    setTokensByStudentId((prev) => mergeTokenMap(prev, students, forGroupId, groupIdRef.current));
  }, []);

  const runBatch = useCallback(
    async ({ mode, confirmReissue, revocationReason, preview, batchMax }) => {
      const forGroupId = groupId;
      if (!forGroupId || executingRef.current) {
        return { ok: false };
      }

      executingRef.current = true;
      setUiState(BULK_UI_STATES.RUNNING_BATCH);
      setLastError(null);

      if (!clientOperationIdRef.current) {
        clientOperationIdRef.current = crypto.randomUUID();
      }

      let cursor =
        batchMeta?.next_batch ??
        buildInitialCursor(preview?.counts?.eligible ?? 0, batchMax);

      try {
        while (forGroupId === groupIdRef.current) {
          if (cursor.to_sequence < cursor.from_sequence) {
            break;
          }

          const payload = {
            client_operation_id: clientOperationIdRef.current,
            mode,
            confirm_reissue: confirmReissue,
            revocation_reason: revocationReason || undefined,
            batch_cursor: cursor,
          };

          const res = await postGroupAttendanceCardsBatch(forGroupId, payload);
          if (forGroupId !== groupIdRef.current) {
            executingRef.current = false;
            return { ok: false, aborted: true };
          }

          const data = res?.data ?? res;
          setOperationMeta(data.operation ?? null);
          setBatchMeta(data.batch ?? null);
          applyBatchStudents(data.students ?? [], forGroupId);

          if (!data.batch?.has_more) {
            setUiState(BULK_UI_STATES.REVIEW);
            executingRef.current = false;
            return { ok: true };
          }

          cursor = data.batch.next_batch;
          if (!cursor) {
            break;
          }
        }

        executingRef.current = false;
        if (forGroupId === groupIdRef.current) {
          setUiState(BULK_UI_STATES.REVIEW);
        }
        return { ok: true };
      } catch (err) {
        executingRef.current = false;
        if (forGroupId !== groupIdRef.current) {
          return { ok: false, aborted: true };
        }
        setUiState(BULK_UI_STATES.UNCERTAIN_BATCH);
        setLastError(err);
        return { ok: false, uncertain: true, error: err };
      }
    },
    [applyBatchStudents, batchMeta, groupId],
  );

  const recoverFromStatus = useCallback(async () => {
    const forGroupId = groupId;
    const operationId = clientOperationIdRef.current;
    if (!forGroupId || !operationId) {
      return { ok: false };
    }

    setUiState(BULK_UI_STATES.RUNNING_BATCH);
    try {
      const res = await getGroupAttendanceCardsBatchStatus(forGroupId, operationId);
      if (forGroupId !== groupIdRef.current) {
        return { ok: false, aborted: true };
      }
      const data = res?.data ?? res;
      setOperationMeta(data.operation ?? null);
      setStudentOutcomes(
        Array.isArray(data.students)
          ? [...data.students]
              .map((row) => {
                const { plain_text_token, ...rest } = row;
                void plain_text_token;
                return rest;
              })
              .sort((a, b) => a.sequence - b.sequence)
          : [],
      );
      setUiState(BULK_UI_STATES.REVIEW);
      return { ok: true };
    } catch (err) {
      if (forGroupId !== groupIdRef.current) {
        return { ok: false, aborted: true };
      }
      setLastError(err);
      setUiState(BULK_UI_STATES.UNCERTAIN_BATCH);
      return { ok: false, error: err };
    }
  }, [groupId]);

  const continueAfterRecovery = useCallback(
    async ({ mode, confirmReissue, revocationReason, preview, batchMax }) => {
      if (!operationMeta || !batchMeta?.has_more) {
        setUiState(BULK_UI_STATES.REVIEW);
        return { ok: true };
      }
      return runBatch({ mode, confirmReissue, revocationReason, preview, batchMax });
    },
    [batchMeta, operationMeta, runBatch],
  );

  return {
    uiState,
    setUiState,
    operationMeta,
    batchMeta,
    studentOutcomes,
    lastError,
    tokensByStudentId,
    clientOperationIdRef,
    modeNeedsReissueConfirm,
    clearTokens,
    resetOperation,
    beginNewOperation,
    runBatch,
    recoverFromStatus,
    continueAfterRecovery,
  };
}
