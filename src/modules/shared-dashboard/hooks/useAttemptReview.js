import { useCallback, useEffect, useMemo, useState } from "react";
import { getAttemptReview } from "../../student-dashboard/services/dashboardService";
import { getStudentAttemptReview as getInstructorAttemptReview } from "../../instructor-dashboard/services/instructorLearningGroupServices";
import { getStudentAttemptReview as getAdminAttemptReview } from "../../admin-dashboard/services/learningGroupServices";
import {
  buildCacheKey,
  getCachedReview,
  setCachedReview,
} from "./attemptReviewCache";

const fetchReviewByRole = async ({ role, attemptId, groupId, studentId }) => {
  if (role === "student") {
    const res = await getAttemptReview(attemptId);
    return res?.data?.data ?? res?.data ?? res;
  }

  if (role === "instructor") {
    const res = await getInstructorAttemptReview(groupId, studentId, attemptId);
    return res?.data ?? res;
  }

  if (role === "admin") {
    const res = await getAdminAttemptReview(groupId, studentId, attemptId);
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
  const cacheKey = useMemo(
    () => buildCacheKey({ role, attemptId, groupId, studentId }),
    [role, attemptId, groupId, studentId],
  );

  const [data, setData] = useState(() => getCachedReview(cacheKey));
  const [loading, setLoading] = useState(
    () => enabled && !!cacheKey && !getCachedReview(cacheKey),
  );
  const [error, setError] = useState(null);

  const loadReview = useCallback(
    async (force = false) => {
      if (!enabled || !cacheKey || !attemptId) return null;

      if (!force) {
        const cached = getCachedReview(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          setError(null);
          return cached;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchReviewByRole({
          role,
          attemptId,
          groupId,
          studentId,
        });
        setCachedReview(cacheKey, result);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [enabled, cacheKey, attemptId, role, groupId, studentId],
  );

  useEffect(() => {
    if (!enabled || !cacheKey || !attemptId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const cached = getCachedReview(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    loadReview();
  }, [enabled, cacheKey, attemptId, loadReview]);

  return { data, loading, error, reload: () => loadReview(true) };
}
