import { useCallback, useEffect, useMemo, useState } from "react";
import { useForbidden } from "../../../contexts/ForbiddenContext";
import { isAbortError, getApiErrorMeta } from "../../../utils/apiErrors";
import { getAttemptReview } from "../../student-dashboard/services/dashboardService";
import { getStudentAttemptReview as getInstructorAttemptReview } from "../../instructor-dashboard/services/instructorLearningGroupServices";
import { getStudentAttemptReview as getAdminAttemptReview } from "../../admin-dashboard/services/learningGroupServices";
import {
  buildCacheKey,
  getCachedReview,
  setCachedReview,
} from "./attemptReviewCache";

const fetchReviewByRole = async ({ role, attemptId, groupId, studentId, signal }) => {
  const config = signal ? { signal } : {};

  if (role === "student") {
    const res = await getAttemptReview(attemptId, config);
    return res?.data?.data ?? res?.data ?? res;
  }

  if (role === "instructor") {
    const res = await getInstructorAttemptReview(groupId, studentId, attemptId, config);
    return res?.data ?? res;
  }

  if (role === "admin") {
    const res = await getAdminAttemptReview(groupId, studentId, attemptId, config);
    return res?.data ?? res;
  }

  throw new Error("Invalid role for attempt review");
};

export function useAttemptReview({
  role = "student",
  attemptId,
  groupId,
  studentId,
  enabled = true,
}) {
  const { forbidden: globalForbidden } = useForbidden();

  const cacheKey = useMemo(
    () => buildCacheKey({ role, attemptId, groupId, studentId }),
    [role, attemptId, groupId, studentId],
  );

  const [data, setData] = useState(() => getCachedReview(cacheKey));
  const [loading, setLoading] = useState(
    () => enabled && !!cacheKey && !getCachedReview(cacheKey),
  );
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const loadReview = useCallback(
    async (force = false, signal) => {
      if (!enabled || !cacheKey || !attemptId) return null;

      if (!force) {
        const cached = getCachedReview(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          setError(null);
          setNotFound(false);
          setForbidden(false);
          return cached;
        }
      }

      setLoading(true);
      setError(null);
      setNotFound(false);
      setForbidden(false);

      try {
        const result = await fetchReviewByRole({
          role,
          attemptId,
          groupId,
          studentId,
          signal,
        });

        if (signal?.aborted) return null;

        setCachedReview(cacheKey, result);
        setData(result);
        return result;
      } catch (err) {
        if (isAbortError(err) || signal?.aborted) return null;

        const meta = getApiErrorMeta(err);
        setForbidden(meta.isForbidden);
        setNotFound(meta.isNotFound);
        setError(err);
        return null;
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [enabled, cacheKey, attemptId, role, groupId, studentId],
  );

  useEffect(() => {
    if (!enabled || !cacheKey || !attemptId) {
      setData(null);
      setLoading(false);
      setError(null);
      setNotFound(false);
      setForbidden(false);
      return undefined;
    }

    const cached = getCachedReview(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      setNotFound(false);
      setForbidden(false);
      return undefined;
    }

    const controller = new AbortController();
    loadReview(false, controller.signal);

    return () => controller.abort();
  }, [enabled, cacheKey, attemptId, loadReview]);

  return {
    data,
    loading: globalForbidden ? false : loading,
    error,
    notFound,
    forbidden: globalForbidden || forbidden,
    reload: () => loadReview(true),
  };
}
