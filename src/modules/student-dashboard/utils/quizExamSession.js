const completedAttemptKey = (quizId) => `quiz_completed_${quizId}`;

export const getCompletedAttemptId = (quizId) => {
  if (!quizId) return null;
  return sessionStorage.getItem(completedAttemptKey(quizId));
};

export const markQuizAttemptCompleted = (quizId, attemptId) => {
  if (!quizId || !attemptId) return;
  sessionStorage.setItem(completedAttemptKey(quizId), String(attemptId));
};

export const clearQuizAttemptCompleted = (quizId) => {
  if (!quizId) return;
  sessionStorage.removeItem(completedAttemptKey(quizId));
};
