import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "react-bootstrap";
import { useAdminExamResults } from "../../hooks/useAdminExamResults";
import "../../../student-dashboard/styles/dashboardShared.css";

function StudentExamResultsModal({
  show,
  groupId,
  examId,
  studentId,
  studentName,
  examTitle,
  totalMarks,
  onHide,
}) {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const { studentExamAttempts, loadingStudentAttempts, loadStudentExamAttempts } =
    useAdminExamResults();

  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    if (show && groupId && studentId && examId) {
      setSelectedAttempt(null);
      loadStudentExamAttempts(groupId, studentId, examId);
    }
  }, [show, groupId, studentId, examId, loadStudentExamAttempts]);

  const attempts = useMemo(() => {
    const raw = Array.isArray(studentExamAttempts) ? studentExamAttempts : [];
    return [...raw]
      .sort((a, b) => (a.attempt_id || 0) - (b.attempt_id || 0))
      .map((attempt, idx) => ({ ...attempt, attempt_number: idx + 1 }))
      .reverse();
  }, [studentExamAttempts]);

  const highestAttempt = useMemo(() => {
    const raw = Array.isArray(studentExamAttempts) ? studentExamAttempts : [];
    if (!raw.length) return null;
    return [...raw].sort(
      (a, b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0)
    )[0];
  }, [studentExamAttempts]);

  const gaugeAttempt = selectedAttempt ?? highestAttempt;

  const getAttemptPercentage = (attempt) => {
    if (!attempt) return 0;
    const score = parseFloat(attempt.score) || 0;
    const total =
      parseFloat(attempt.total_marks) ||
      parseFloat(totalMarks) ||
      parseFloat(attempt.passing_mark) ||
      0;
    return total > 0 ? Math.min((score / total) * 100, 100) : 0;
  };

  const gaugePercentage = getAttemptPercentage(gaugeAttempt);
  const HALF_CIRC = Math.PI * 80;
  const filled = (gaugePercentage / 100) * HALF_CIRC;

  const isGaugeFailed =
    !gaugeAttempt ||
    gaugeAttempt.status === "failed" ||
    gaugeAttempt.is_passed === false;

  const strokeColor = isGaugeFailed ? "#ef4444" : "#22c55e";
  const isShowingBest = selectedAttempt === null;

  const formatScore = (attempt) => {
    const score = Number(attempt.score);
    const total =
      attempt.total_marks != null
        ? Number(attempt.total_marks)
        : totalMarks != null
          ? Number(totalMarks)
          : null;
    return total != null ? `${score} / ${total}` : `${score} / N/A`;
  };

  const isAttemptFailed = (attempt) =>
    attempt.status === "failed" || attempt.is_passed === false;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="md"
      className="quiz-detail-modal"
      scrollable
    >
      <div
        className="d-flex align-items-center justify-content-between pt-3 px-4 pb-2"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <Modal.Title className="fs-5 fw-bold">
          {loadingStudentAttempts
            ? t("studentResults.loading", "Loading…")
            : studentName || t("studentResults.studentDetails", "Student Details")}
        </Modal.Title>
        <button
          type="button"
          className="btn-close border-0 bg-transparent"
          onClick={onHide}
          aria-label="Close"
        />
      </div>

      <Modal.Body className="pt-3 px-4 pb-4" dir={isArabic ? "rtl" : "ltr"}>
        {examTitle && (
          <p className="text-muted small mb-3">
            {examTitle}
          </p>
        )}

        {loadingStudentAttempts ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status" />
            <p className="mt-2 text-muted">
              {t("studentResults.loading", "Loading…")}
            </p>
          </div>
        ) : (
          <div className="quiz-modal-content">
            <div className="quiz-modal-gauge-section">
              <span className="quiz-modal-gauge-title">
                {isShowingBest
                  ? t("studentResults.highestScore", "Highest Score Achieved")
                  : `${isArabic ? "محاولة" : "Attempt"} #${gaugeAttempt?.attempt_number ?? ""}`}
              </span>

              {gaugeAttempt ? (
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
                          transition:
                            "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                      <text
                        x="100"
                        y="82"
                        textAnchor="middle"
                        fontSize="32"
                        fontWeight="800"
                        fill="#1a1a1a"
                      >
                        {Number(gaugeAttempt.score)}
                      </text>
                      <text
                        x="100"
                        y="100"
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="500"
                        fill="#999"
                      >
                        /{" "}
                        {gaugeAttempt.total_marks != null
                          ? gaugeAttempt.total_marks
                          : totalMarks ?? "N/A"}
                      </text>
                    </svg>
                  </div>

                  <p
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: strokeColor,
                      margin: "0 0 6px",
                    }}
                  >
                    {gaugePercentage > 0 ? `${gaugePercentage.toFixed(1)}%` : "—"}
                  </p>

                  <span
                    className="quiz-modal-gauge-status"
                    style={{
                      backgroundColor: isGaugeFailed ? "#fee2e2" : "#d1fae5",
                      color: isGaugeFailed ? "#991b1b" : "#065f46",
                    }}
                  >
                    {isGaugeFailed
                      ? t("studentResults.failed", "Failed")
                      : t("studentResults.passed", "Passed")}
                  </span>
                </>
              ) : (
                <p className="text-muted py-2">
                  {t("studentResults.noAttempts", "No previous attempts found.")}
                </p>
              )}
            </div>

            <div className="quiz-modal-attempts-section">
              <div className="quiz-attempts-header">
                <span className="quiz-modal-attempts-title">
                  {t("studentResults.attemptsHistory", "Attempts History")}
                </span>
                {!isShowingBest && (
                  <button
                    type="button"
                    className="quiz-best-btn"
                    onClick={() => setSelectedAttempt(null)}
                  >
                    <i className="bi bi-trophy-fill me-1" />
                    {isArabic ? "الأفضل" : "Best"}
                  </button>
                )}
              </div>

              {attempts.length > 0 ? (
                <div className="quiz-attempts-scrollbar">
                  {attempts.map((attempt, idx) => {
                    const failed = isAttemptFailed(attempt);
                    const isActive =
                      selectedAttempt?.attempt_id === attempt.attempt_id;

                    return (
                      <div
                        className={`quiz-attempt-row ${
                          isActive ? "quiz-attempt-row--active" : ""
                        }`}
                        key={attempt.attempt_id || idx}
                        onClick={() =>
                          setSelectedAttempt(isActive ? null : attempt)
                        }
                        style={{ cursor: "pointer" }}
                        title={
                          isArabic
                            ? "اضغط لعرضها أعلاه"
                            : "Click to preview above"
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedAttempt(isActive ? null : attempt);
                          }
                        }}
                      >
                        <div className="quiz-attempt-info">
                          <span className="quiz-attempt-num">
                            {t("studentResults.attemptNum", {
                              num: attempt.attempt_number,
                              defaultValue: `Attempt ${attempt.attempt_number}`,
                            })}
                          </span>
                          <span className="quiz-attempt-date">
                            {attempt.finished_at || "—"}
                          </span>
                        </div>

                        <div className="quiz-attempt-score-status">
                          <span className="quiz-attempt-score">
                            {formatScore(attempt)}
                          </span>
                          <span
                            className={`quiz-attempt-badge ${
                              failed ? "badge-failed" : "badge-passed"
                            }`}
                          >
                            {failed
                              ? t("studentResults.failed", "Failed")
                              : t("studentResults.passed", "Passed")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted text-center py-3">
                  {t("studentResults.noAttempts", "No previous attempts found.")}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default StudentExamResultsModal;
