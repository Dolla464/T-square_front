import { useMemo, useState } from "react";
import AttemptReviewPanel from "../../shared-dashboard/components/AttemptAnswerReview/AttemptReviewPanel";
import { formatExamScore, formatExamScorePair } from "../../shared-dashboard/utils/formatExamScore";
import {
  getAttemptStatusBadgeClass,
  isAttemptFailed,
  isAwaitingGrading,
  pickHighestGradedAttempt,
  resolveGaugeAttempt,
  UNDER_GRADING_BADGE_STYLE,
} from "../../shared-dashboard/utils/examAttemptDisplay";
import "../../shared-dashboard/components/AttemptAnswerReview/attemptReview.css";

function QuizResultsContent({
  quiz,
  results,
  loading,
  error,
  t,
  isArabic,
}) {
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const attempts = useMemo(
    () => (Array.isArray(results?.data) ? results.data : []),
    [results],
  );

  const displayAttempts = useMemo(
    () =>
      [...attempts]
        .sort((a, b) => (a.attempt_id || 0) - (b.attempt_id || 0))
        .map((attempt, idx) => ({ ...attempt, attempt_number: idx + 1 }))
        .reverse(),
    [attempts],
  );

  const highestGradedAttempt = pickHighestGradedAttempt(attempts);
  const gaugeAttempt = resolveGaugeAttempt(selectedAttempt, attempts);
  const reviewAttemptId = selectedAttempt?.attempt_id ?? null;
  const isGaugeAwaitingGrading = isAwaitingGrading(gaugeAttempt);

  const getAttemptPercentage = (attempt) => {
    if (!attempt) return 0;
    const score = parseFloat(attempt.score) || 0;
    const total =
      parseFloat(attempt.total_marks) ||
      parseFloat(attempt.passing_mark) ||
      0;
    return total > 0 ? Math.min((score / total) * 100, 100) : 0;
  };

  const gaugePercentage = getAttemptPercentage(gaugeAttempt);
  const HALF_CIRC = Math.PI * 80;
  const filled = (gaugePercentage / 100) * HALF_CIRC;
  const isGaugeFailed = isAttemptFailed(gaugeAttempt);
  const strokeColor = isGaugeFailed ? "#ef4444" : "#22c55e";

  const isBestAttempt = (attempt) =>
    highestGradedAttempt &&
    attempt?.attempt_id === highestGradedAttempt.attempt_id;

  const isShowingBest = !selectedAttempt || isBestAttempt(selectedAttempt);

  const formatScore = (attempt) =>
    formatExamScorePair(attempt.score, attempt.total_marks);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status" />
        <p className="mt-2 text-muted">{t("quiz_results.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-danger">
        <i className="bi bi-exclamation-triangle-fill fs-2 mb-2 d-block" />
        <p className="mb-0">{t("quiz_results.error")}</p>
      </div>
    );
  }

  return (
    <div className="quiz-modal-content">
      <div className="quiz-modal-gauge-section">
        <span className="quiz-modal-gauge-title">
          {isShowingBest
            ? t("quiz_results.highest_score")
            : `${isArabic ? "محاولة" : "Attempt"} #${gaugeAttempt?.attempt_number ?? ""}`}
        </span>

        {gaugeAttempt ? (
          isGaugeAwaitingGrading ? (
            <>
              <div
                className="quiz-modal-gauge-wrapper d-flex align-items-center justify-content-center"
                style={{ minHeight: "120px" }}
              >
                <i
                  className="bi bi-hourglass-split"
                  style={{ fontSize: "3rem", color: "#d97706" }}
                  aria-hidden="true"
                />
              </div>
              <span
                className="quiz-modal-gauge-status"
                style={UNDER_GRADING_BADGE_STYLE}
              >
                {t("quiz_results.under_grading")}
              </span>
            </>
          ) : (
            <>
              <div className="quiz-modal-gauge-wrapper">
                <svg
                  viewBox="0 0 200 110"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "100%", height: "100%", overflow: "visible" }}
                >
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${filled} ${HALF_CIRC}`}
                    style={{
                      transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                  <text x="100" y="82" textAnchor="middle" fontSize="32" fontWeight="800" fill="#1a1a1a">
                    {formatExamScore(gaugeAttempt.score)}
                  </text>
                  <text x="100" y="100" textAnchor="middle" fontSize="13" fontWeight="500" fill="#999">
                    / {gaugeAttempt.total_marks != null ? formatExamScore(gaugeAttempt.total_marks) : "N/A"}
                  </text>
                </svg>
              </div>

              <p style={{ fontSize: "1.3rem", fontWeight: 700, color: strokeColor, margin: "0 0 6px" }}>
                {gaugePercentage > 0 ? `${gaugePercentage.toFixed(1)}%` : "—"}
              </p>

              <span
                className="quiz-modal-gauge-status"
                style={{
                  backgroundColor: isGaugeFailed ? "#fee2e2" : "#d1fae5",
                  color: isGaugeFailed ? "#991b1b" : "#065f46",
                }}
              >
                {isGaugeFailed ? t("quiz_results.failed") : t("quiz_results.passed")}
              </span>
            </>
          )
        ) : (
          <p className="text-muted py-2">{t("quiz_results.no_attempts")}</p>
        )}
      </div>

      <div className="quiz-modal-attempts-section">
        <div className="quiz-attempts-header">
          <span className="quiz-modal-attempts-title">
            {isArabic ? "سجل المحاولات" : "Attempts History"}
          </span>
          {selectedAttempt && !isBestAttempt(selectedAttempt) ? (
            <button
              type="button"
              className="quiz-best-btn"
              onClick={() => setSelectedAttempt(null)}
            >
              <i className="bi bi-trophy-fill me-1" />
              {t("quiz_results.best_badge")}
            </button>
          ) : null}
        </div>

        {displayAttempts.length > 0 ? (
          <div className="quiz-attempts-scrollbar">
            {displayAttempts.map((attempt, idx) => {
              const failed = isAttemptFailed(attempt);
              const isActive = selectedAttempt?.attempt_id === attempt.attempt_id;

              return (
                <div
                  className={`quiz-attempt-row ${isActive ? "quiz-attempt-row--active" : ""}`}
                  key={attempt.attempt_id || idx}
                  onClick={() => {
                    setSelectedAttempt(isActive ? null : attempt);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedAttempt(isActive ? null : attempt);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="quiz-attempt-info">
                    <span className="quiz-attempt-num">
                      {t("quiz_results.attempt_num", { num: attempt.attempt_number })}
                      {isBestAttempt(attempt) ? (
                        <span className="quiz-attempt-best-badge ms-2">
                          <i className="bi bi-trophy-fill me-1" />
                          {t("quiz_results.best_badge")}
                        </span>
                      ) : null}
                    </span>
                    <span className="quiz-attempt-date">
                      {attempt.finished_at || "—"}
                    </span>
                  </div>

                  <div className="quiz-attempt-score-status">
                    <span className="quiz-attempt-score">
                      {isAwaitingGrading(attempt) ? "—" : formatScore(attempt)}
                    </span>
                    <span className={`quiz-attempt-badge ${getAttemptStatusBadgeClass(attempt)}`}>
                      {isAwaitingGrading(attempt)
                        ? t("quiz_results.under_grading")
                        : failed
                          ? t("quiz_results.failed")
                          : t("quiz_results.passed")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted text-center py-3">{t("quiz_results.no_attempts")}</p>
        )}
      </div>

      {selectedAttempt ? (
        <div className="quiz-modal-review-section mt-3">
          <AttemptReviewPanel
            role="student"
            attemptId={reviewAttemptId}
            quizId={quiz.id}
            enabled={Boolean(reviewAttemptId)}
          />
        </div>
      ) : null}
    </div>
  );
}

export default QuizResultsContent;
