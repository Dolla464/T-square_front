import { useCallback, useRef, useState } from "react";
import {
  getGroupAttendanceCardsBatchStatus,
  postGroupAttendanceCardsBatch,
} from "../../../services/learningGroupServices";
import { BULK_CARD_MODES } from "../components/GroupAttendanceCardsPreviewPanel";

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

/**
 * In-memory token map only — never persisted to storage.
 * Clearing refs does not guarantee OS memory zeroization.
 */
export function useGroupAttendanceCardBulk(groupId) {
  const [uiState, setUiState] = useState(BULK_UI_STATES.IDLE);
  const [operationMeta, setOperationMeta] = useState(null);
  const [batchMeta, setBatchMeta] = useState(null);
  const [studentOutcomes, setStudentOutcomes] = useState([]);
  const [lastError, setLastError] = useState(null);

  const clientOperationIdRef = useRef(null);
  const tokenByStudentIdRef = useRef(new Map());
  const executingRef = useRef(false);
  const groupIdRef = useRef(groupId);
  groupIdRef.current = groupId;

  const clearTokens = useCallback(() => {
    tokenByStudentIdRef.current = new Map();
  }, []);

  const resetOperation = useCallback(() => {
    clientOperationIdRef.current = null;
    clearTokens();
    setOperationMeta(null);
    setBatchMeta(null);
    setStudentOutcomes([]);
    setLastError(null);
    setUiState(BULK_UI_STATES.CLEARED);
  }, [clearTokens]);

  const beginNewOperation = useCallback(() => {
    clientOperationIdRef.current = null;
    setOperationMeta(null);
    setBatchMeta(null);
    setStudentOutcomes([]);
    setLastError(null);
  }, []);

  const mergeBatchStudents = useCallback((students) => {
    if (!Array.isArray(students)) {
      return;
    }
    setStudentOutcomes((prev) => {
      const bySeq = new Map(prev.map((row) => [row.sequence, row]));
      students.forEach((row) => {
        bySeq.set(row.sequence, row);
        if (row.plain_text_token && row.student_id) {
          tokenByStudentIdRef.current.set(row.student_id, row.plain_text_token);
        }
      });
      return Array.from(bySeq.values()).sort((a, b) => a.sequence - b.sequence);
    });
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
            return { ok: false, aborted: true };
          }

          const data = res?.data ?? res;
          setOperationMeta(data.operation ?? null);
          setBatchMeta(data.batch ?? null);
          mergeBatchStudents(data.students ?? []);

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
        setUiState(BULK_UI_STATES.REVIEW);
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
    [batchMeta, groupId, mergeBatchStudents],
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
          ? [...data.students].sort((a, b) => a.sequence - b.sequence)
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
    clientOperationIdRef,
    tokenByStudentIdRef,
    modeNeedsReissueConfirm,
    clearTokens,
    resetOperation,
    beginNewOperation,
    runBatch,
    recoverFromStatus,
    continueAfterRecovery,
  };
}
