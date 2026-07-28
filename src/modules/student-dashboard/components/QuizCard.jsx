import i18next from "i18next";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DetailModal from "../../../components/shared/DetailModal/DetailModal";
import AttemptReviewPanel from "../../shared-dashboard/components/AttemptAnswerReview/AttemptReviewPanel";
import { formatExamScore, formatExamScorePair } from "../../shared-dashboard/utils/formatExamScore";
import { useExamResults } from "../hooks/useExamResults";
import "../../shared-dashboard/components/AttemptAnswerReview/attemptReview.css";

/**
 * كومبوننت كارت الكويز
 * @param {object} quiz - بيانات الكويز القادمة من الـ API
 * @param {function} t  - دالة الترجمة
 */
function QuizCard({ quiz, t }) {
  const navigate = useNavigate();
  const isArabic = i18next.language === "ar";

  // ── حالة المودال ──────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const { results, loading, error, fetchResults } = useExamResults(quiz.id);

  const handleShowResults = () => {
    setShowModal(true);
    setSelectedAttempt(null);
    setShowAnswers(false);
    fetchResults();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAttempt(null);
    setShowAnswers(false);
  };

  // ── بيانات الكويز ──────────────────────────────────────────────────
  const {
    is_locked,
    has_ongoing_attempt,
    remaining_attempts,
    attempts_count,
    max_attempts,
    has_attempt,
    duration,
    is_passed_before,
  } = quiz;

  const handleStartQuiz = () => {
    if (has_ongoing_attempt || !is_locked) {
      navigate(`/student/quizzes/${quiz.id}`);
    }
  };

  // ── معالجة المحاولات من الـ API ────────────────────────────────────
  // الاستجابة الفعلية: { data: [ { attempt_id, score, total_marks, passing_mark, status, is_passed, finished_at, ... } ] }
  const attempts = Array.isArray(results?.data) ? results.data : [];

  // ترقيم زمني تصاعدي (محاولة 1 = الأقدم)
  const displayAttempts = [...attempts]
    .sort((a, b) => (a.attempt_id || 0) - (b.attempt_id || 0))
    .map((attempt, idx) => ({ ...attempt, attempt_number: idx + 1 }))
    .reverse(); // الأحدث أولاً في العرض

  // أعلى درجة
  const highestAttempt = attempts.length
    ? [...attempts].sort(
        (a, b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0)
      )[0]
    : null;

  // ── حساب الـ Gauge للمحاولة المعروضة (selected أو highest) ──────────
  const gaugeAttempt = selectedAttempt ?? highestAttempt;
  const reviewAttemptId = gaugeAttempt?.attempt_id ?? null;

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

  const isGaugeFailed =
    !gaugeAttempt ||
    gaugeAttempt.status === "failed" ||
    gaugeAttempt.is_passed === false;

  const strokeColor = isGaugeFailed ? "#ef4444" : "#22c55e";

  // هل المحاولة المعروضة هي الـ highest
  const isShowingBest = selectedAttempt === null;

  // ── دالة مساعدة: عرض الدرجة / المجموع (أو N/A) ───────────────────
  const formatScore = (attempt) =>
    formatExamScorePair(attempt.score, attempt.total_marks);

  // ── تحديد حالة المحاولة ───────────────────────────────────────────
  const isAttemptFailed = (attempt) =>
    attempt.status === "failed" || attempt.is_passed === false;

  // ── الـ Render ─────────────────────────────────────────────────────
  return (
    <div className={`quiz-card ${is_locked && !has_ongoing_attempt ? "quiz-card-locked" : ""}`}>
      {/* صورة / أيقونة الكارد */}
      <div className="quiz-card-icon-wrapper">
        <i
          className={`bi ${
            is_passed_before
              ? "bi-check-circle-fill text-success"
              : has_ongoing_attempt
              ? "bi-play-circle-fill text-primary"
              : is_locked
              ? "bi-lock-fill"
              : "bi-pencil-square"
          } quiz-card-icon`}
        ></i>

        {/* Badge الحالة */}
        <span
          className="quiz-badge"
          style={
            is_passed_before
              ? { backgroundColor: "#d1fae5", color: "#065f46" }
              : has_ongoing_attempt
              ? { backgroundColor: "#dbeafe", color: "#1e40af" }
              : is_locked
              ? { backgroundColor: "#ffcccc", color: "#990000" }
              : { backgroundColor: "#c5e9ff", color: "#0d47a1" }
          }
        >
          {is_passed_before
            ? isArabic ? "ناجح" : "Passed"
            : has_ongoing_attempt
            ? isArabic ? "جاري" : "In Progress"
            : is_locked
            ? isArabic ? "مغلق" : "Locked"
            : isArabic ? "مفتوح" : "Open"}
        </span>
      </div>

      {/* جسم الكارد */}
      <div className="quiz-card-body">
        <h6 className="quiz-card-title">{quiz.title}</h6>
        <p className="quiz-card-meta">{quiz.description}</p>
        <p className="quiz-card-meta">{quiz.course_title}</p>

        {/* المحاولات المتبقية */}
        <div className="quiz-attempts-counter mb-1" style={{ fontSize: "0.82rem", color: "#6c757d" }}>
          <i className="bi bi-info-circle me-1"></i>
          <span>
            {max_attempts
              ? isArabic
                ? `المحاولات المتبقية: ${remaining_attempts}`
                : `Remaining Attempts: ${remaining_attempts}`
              : isArabic
              ? "المحاولات: غير محدودة"
              : "Attempts: Unlimited"}
          </span>
        </div>

        {/* المدة الزمنية */}
        <div className="quiz-attempts-counter mb-1" style={{ fontSize: "0.82rem", color: "#6c757d" }}>
          <i className="bi bi-clock-history me-1"></i>
          <span>
            {duration
              ? isArabic ? `الوقت المخصص: ${duration}` : `Time: ${duration}`
              : isArabic ? "الوقت: غير محدد" : "Time: N/A"}
          </span>
        </div>

        {/* أزرار الإجراءات */}
        <div className="d-flex gap-2">
          {/* زر المراجعة - يظهر عند وجود محاولات سابقة */}
          {attempts_count > 0 && (
            <button
              type="button"
              onClick={handleShowResults}
              className="btn-continue btn-review flex-grow-1 text-center py-2 rounded"
            >
              <i className="bi bi-eye me-1"></i>
              {t("active_courses.review")}
            </button>
          )}

          {/* زر الدخول / الإعادة */}
          {has_ongoing_attempt ? (
            <button onClick={handleStartQuiz} className="btn-continue flex-grow-1">
              <i className="bi bi-play-circle me-1"></i>
              {isArabic ? "متابعة الاختبار" : "Resume Quiz"}
            </button>
          ) : is_locked ? (
            <button
              disabled
              className="btn-continue bg-secondary-subtle text-muted border-0 w-100"
            >
              {isArabic ? "استنفدت محاولاتك" : "No attempts left"}
            </button>
          ) : (
            <button onClick={handleStartQuiz} className="btn-continue flex-grow-1">
              <i
                className={`${
                  !has_attempt ? "bi bi-play-circle" : "bi bi-arrow-counterclockwise"
                } me-1`}
              ></i>
              {!has_attempt
                ? isArabic ? "بدء الاختبار" : "Start Quiz"
                : is_passed_before
                ? isArabic ? "تحسين الدرجة" : "Improve Score"
                : isArabic ? "إعادة المحاولة" : "Retry"}
            </button>
          )}
        </div>
      </div>

      {/* ── مودال تفاصيل النتائج والمحاولات ── */}
      <DetailModal
        show={showModal}
        onHide={handleCloseModal}
        title={t("quiz_results.title")}
        dir={isArabic ? "rtl" : "ltr"}
        size="xl"
        scrollable
        className="quiz-results-review-modal"
        bodyClassName="pt-0 px-4 pb-4"
      >
          {/* حالة التحميل */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status"></div>
              <p className="mt-2 text-muted">{t("quiz_results.loading")}</p>
            </div>
          ) : error ? (
            /* حالة الخطأ */
            <div className="text-center py-4 text-danger">
              <i className="bi bi-exclamation-triangle-fill fs-2 mb-2 d-block"></i>
              <p className="mb-0">{t("quiz_results.error")}</p>
            </div>
          ) : (
            <div className="quiz-modal-content">
              <div className="quiz-modal-gauge-section">
                {/* عنوان الـ Gauge — يتغير حسب المحاولة المعروضة */}
                <span className="quiz-modal-gauge-title">
                  {isShowingBest
                    ? t("quiz_results.highest_score")
                    : `${isArabic ? "محاولة" : "Attempt"} #${gaugeAttempt?.attempt_number ?? ""}`}
                </span>

                {gaugeAttempt ? (
                  <>
                    {/* SVG Semicircle Gauge */}
                    <div className="quiz-modal-gauge-wrapper">
                      <svg
                        viewBox="0 0 200 110"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: "100%", height: "100%", overflow: "visible" }}
                      >
                        {/* المسار الرمادي الخلفي */}
                        <path
                          d="M 20 100 A 80 80 0 0 1 180 100"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="14"
                          strokeLinecap="round"
                        />
                        {/* قوس التقدم المتحرك */}
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
                        {/* نص الدرجة */}
                        <text x="100" y="82" textAnchor="middle" fontSize="32" fontWeight="800" fill="#1a1a1a">
                          {formatExamScore(gaugeAttempt.score)}
                        </text>
                        {/* نص المجموع */}
                        <text x="100" y="100" textAnchor="middle" fontSize="13" fontWeight="500" fill="#999">
                          / {gaugeAttempt.total_marks != null ? formatExamScore(gaugeAttempt.total_marks) : "N/A"}
                        </text>
                      </svg>
                    </div>

                    {/* النسبة المئوية */}
                    <p style={{ fontSize: "1.3rem", fontWeight: 700, color: strokeColor, margin: "0 0 6px" }}>
                      {gaugePercentage > 0 ? `${gaugePercentage.toFixed(1)}%` : "—"}
                    </p>

                    {/* بادج الحالة (ناجح / راسب) */}
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
                ) : (
                  <p className="text-muted py-2">{t("quiz_results.no_attempts")}</p>
                )}
              </div>

              {/* ── قسم سجل المحاولات ── */}
              <div className="quiz-modal-attempts-section">
                {/* Header row: عنوان + زر Best */}
                <div className="quiz-attempts-header">
                  <span className="quiz-modal-attempts-title">
                    {isArabic ? "سجل المحاولات" : "Attempts History"}
                  </span>
                  {!isShowingBest && (
                    <button
                      type="button"
                      className="quiz-best-btn"
                      onClick={() => setSelectedAttempt(null)}
                    >
                      <i className="bi bi-trophy-fill me-1"></i>
                      {isArabic ? "الأفضل" : "Best"}
                    </button>
                  )}
                </div>

                {displayAttempts.length > 0 ? (
                  <div className="quiz-attempts-scrollbar">
                    {displayAttempts.map((attempt, idx) => {
                      const failed = isAttemptFailed(attempt);
                      const isActive =
                        selectedAttempt?.attempt_id === attempt.attempt_id;

                      return (
                        <div
                          className={`quiz-attempt-row ${
                            isActive ? "quiz-attempt-row--active" : ""
                          }`}
                          key={attempt.attempt_id || idx}
                          onClick={() => {
                            const next = isActive ? null : attempt;
                            setSelectedAttempt(next);
                            setShowAnswers(!!next);
                          }}
                          style={{ cursor: "pointer" }}
                          title={isArabic ? "اضغط لعرضها أعلاه" : "Click to preview above"}
                        >
                          {/* رقم المحاولة + التاريخ */}
                          <div className="quiz-attempt-info">
                            <span className="quiz-attempt-num">
                              {t("quiz_results.attempt_num", { num: attempt.attempt_number })}
                            </span>
                            <span className="quiz-attempt-date">
                              {attempt.finished_at || "—"}
                            </span>
                          </div>

                          {/* الدرجة + بادج الحالة */}
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
                                ? t("quiz_results.failed")
                                : t("quiz_results.passed")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted text-center py-3">
                    {t("quiz_results.no_attempts")}
                  </p>
                )}
              </div>

              {gaugeAttempt ? (
                <div className="quiz-modal-review-section mt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-semibold">
                      {t("attempt_review.view_answers")}
                    </span>
                    {!showAnswers ? (
                      <button
                        type="button"
                        className="btn btn-review-action btn-sm"
                        onClick={() => setShowAnswers(true)}
                      >
                        <i className="bi bi-list-check me-1" />
                        {t("attempt_review.view_answers")}
                      </button>
                    ) : null}
                  </div>

                  {showAnswers ? (
                    <AttemptReviewPanel
                      role="student"
                      attemptId={reviewAttemptId}
                      quizId={quiz.id}
                      enabled={!!reviewAttemptId}
                      fullPageTo={`/student/quizzes/${quiz.id}/attempts/${reviewAttemptId}/review`}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
      </DetailModal>
    </div>
  );
}

export default QuizCard;
