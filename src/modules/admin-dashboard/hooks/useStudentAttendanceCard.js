import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toastError, toastSuccess } from "../../../components/shared/Toaster/toaster";
import { isAbortError } from "../../../utils/apiErrors";
import {
  fetchStudentAttendanceCard,
  issueStudentAttendanceCard,
  reissueStudentAttendanceCard,
  revokeStudentAttendanceCard,
} from "../services/studentAttendanceCardService";
import { getAttendanceCardErrorMessage } from "../utils/attendanceCardApiErrors";

/** @typedef {'success' | 'error' | 'aborted' | 'ambiguous' | 'stale'} AttendanceCardActionOutcome */

/**
 * @returns {Promise<{ outcome: AttendanceCardActionOutcome, data: object | null }>}
 */
function isUncertainNetworkError(error) {
  return Boolean(error?.request && !error?.response && !isAbortError(error));
}

export function useStudentAttendanceCard(studentId) {
  const { t } = useTranslation("adminDashboard");
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cardStatus, setCardStatus] = useState(null);
  const [statusLoadFailed, setStatusLoadFailed] = useState(false);
  const actionLockRef = useRef(false);
  const studentIdRef = useRef(studentId);
  const statusAbortRef = useRef(null);
  const actionAbortRef = useRef(null);

  studentIdRef.current = studentId;

  const loadStatus = useCallback(
    async ({ silent = false, signal } = {}) => {
      const forStudentId = studentIdRef.current;
      if (!forStudentId) {
        setCardStatus(null);
        return null;
      }

      if (!silent) {
        setStatusLoading(true);
      }
      try {
        const res = await fetchStudentAttendanceCard(forStudentId, { signal });
        if (forStudentId !== studentIdRef.current) {
          return null;
        }
        const payload = res?.data ?? null;
        setCardStatus(payload);
        setStatusLoadFailed(false);
        return payload;
      } catch (err) {
        if (isAbortError(err)) {
          return null;
        }
        if (forStudentId !== studentIdRef.current) {
          return null;
        }
        toastError(getAttendanceCardErrorMessage(err, t));
        setCardStatus(null);
        setStatusLoadFailed(true);
        return null;
      } finally {
        if (!silent && forStudentId === studentIdRef.current) {
          setStatusLoading(false);
        }
      }
    },
    [t],
  );

  useEffect(() => {
    statusAbortRef.current?.abort();
    const controller = new AbortController();
    statusAbortRef.current = controller;

    let active = true;

    (async () => {
      if (!studentId) {
        if (active) {
          setCardStatus(null);
        }
        return;
      }

      setStatusLoading(true);
      try {
        const res = await fetchStudentAttendanceCard(studentId, {
          signal: controller.signal,
        });
        if (active && studentIdRef.current === studentId) {
          setCardStatus(res?.data ?? null);
          setStatusLoadFailed(false);
        }
      } catch (err) {
        if (isAbortError(err)) {
          return;
        }
        if (active && studentIdRef.current === studentId) {
          toastError(getAttendanceCardErrorMessage(err, t));
          setCardStatus(null);
          setStatusLoadFailed(true);
        }
      } finally {
        if (active && studentIdRef.current === studentId) {
          setStatusLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [studentId, t]);

  useEffect(
    () => () => {
      actionAbortRef.current?.abort();
    },
    [studentId],
  );

  const runAction = useCallback(
    async (actionFn, { successKey, mutating = false } = {}) => {
      if (!studentId || actionLockRef.current) {
        return { outcome: "error", data: null };
      }

      const studentAtStart = studentId;
      actionAbortRef.current?.abort();
      const controller = new AbortController();
      actionAbortRef.current = controller;

      actionLockRef.current = true;
      setActionLoading(true);

      const uncertainKey = "students_page.attendance_card.action_outcome_uncertain";

      try {
        const res = await actionFn(controller.signal);
        if (studentAtStart !== studentIdRef.current) {
          return { outcome: "stale", data: res?.data ?? null };
        }
        if (successKey) {
          toastSuccess(t(successKey));
        }
        await loadStatus({
          silent: true,
          signal: controller.signal,
        });
        return { outcome: "success", data: res?.data ?? null };
      } catch (err) {
        if (isAbortError(err)) {
          if (mutating && studentAtStart === studentIdRef.current) {
            toastError(t(uncertainKey));
          }
          return { outcome: "aborted", data: null };
        }
        if (isUncertainNetworkError(err)) {
          if (studentAtStart === studentIdRef.current) {
            toastError(t(uncertainKey));
          }
          return { outcome: "ambiguous", data: null };
        }
        if (studentAtStart === studentIdRef.current) {
          toastError(getAttendanceCardErrorMessage(err, t));
        }
        return { outcome: "error", data: null };
      } finally {
        if (studentAtStart === studentIdRef.current) {
          setActionLoading(false);
        }
        actionLockRef.current = false;
      }
    },
    [studentId, loadStatus, t],
  );

  const issueCard = useCallback(
    () =>
      runAction(
        (signal) => issueStudentAttendanceCard(studentId, { signal }),
        {
          successKey: "students_page.attendance_card.toast_issued",
          mutating: true,
        },
      ),
    [runAction, studentId],
  );

  const reissueCard = useCallback(
    (revocationReason) =>
      runAction(
        (signal) =>
          reissueStudentAttendanceCard(
            studentId,
            { revocation_reason: revocationReason || undefined },
            { signal },
          ),
        {
          successKey: "students_page.attendance_card.toast_reissued",
          mutating: true,
        },
      ),
    [runAction, studentId],
  );

  const revokeCard = useCallback(
    (revocationReason) =>
      runAction(
        (signal) =>
          revokeStudentAttendanceCard(
            studentId,
            { revocation_reason: revocationReason || undefined },
            { signal },
          ),
        {
          successKey: "students_page.attendance_card.toast_revoked",
          mutating: true,
        },
      ),
    [runAction, studentId],
  );

  return {
    cardStatus,
    statusLoading,
    statusLoadFailed,
    actionLoading,
    loadStatus,
    issueCard,
    reissueCard,
    revokeCard,
  };
}
