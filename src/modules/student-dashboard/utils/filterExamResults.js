export function hasExamAttempts(quiz) {
  if (!quiz || typeof quiz !== "object") {
    return false;
  }

  if (quiz.has_attempt === true) {
    return true;
  }

  const count = Number(quiz.attempts_count);
  return Number.isFinite(count) && count > 0;
}

export function isExamPassedFromList(quiz) {
  return Boolean(quiz?.is_passed_before);
}

export function isExamFailedFromList(quiz) {
  return (
    hasExamAttempts(quiz) &&
    !isExamPassedFromList(quiz) &&
    Boolean(quiz?.is_locked)
  );
}

export function filterExamResults(quizzes) {
  if (!Array.isArray(quizzes)) {
    return [];
  }

  return quizzes.filter(hasExamAttempts);
}

export function filterExamResultsByStatus(quizzes, filterKey) {
  const withAttempts = filterExamResults(quizzes);

  if (filterKey === "passed") {
    return withAttempts.filter(isExamPassedFromList);
  }

  if (filterKey === "failed") {
    return withAttempts.filter(isExamFailedFromList);
  }

  return withAttempts;
}

export function computeExamResultsStats(quizzes) {
  const withAttempts = filterExamResults(quizzes);

  return {
    total: withAttempts.length,
    passed: withAttempts.filter(isExamPassedFromList).length,
    failed: withAttempts.filter(isExamFailedFromList).length,
  };
}

export function matchesExamResultsSearch(quiz, searchTerm) {
  const query = String(searchTerm ?? "").trim().toLowerCase();
  if (!query) {
    return true;
  }

  const title = String(quiz?.title ?? "").toLowerCase();
  const course = String(quiz?.course_title ?? "").toLowerCase();

  return title.includes(query) || course.includes(query);
}
