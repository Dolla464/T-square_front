const cache = new Map();

export const buildCacheKey = ({ role, attemptId, groupId, studentId }) => {
  if (!attemptId) return null;
  if (role === "student") return `student:${attemptId}`;
  return `${role}:${groupId}:${studentId}:${attemptId}`;
};

export const getCachedReview = (key) => {
  if (!key) return null;
  return cache.get(key)?.data ?? null;
};

export const setCachedReview = (key, data) => {
  if (!key) return;
  cache.set(key, { data, fetchedAt: Date.now() });
};

export const invalidateAttemptReview = (attemptId) => {
  if (!attemptId) return;
  const suffix = `:${attemptId}`;
  for (const key of cache.keys()) {
    if (key.endsWith(suffix) || key === `student:${attemptId}`) {
      cache.delete(key);
    }
  }
};
