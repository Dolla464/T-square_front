import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import i18next from "i18next";
import { Spinner } from "react-bootstrap";
import { useLeaveReview } from "../../hooks/useLeaveReview";
import {
  INSTRUCTOR_REVIEW_GROUP,
  SHARED_REVIEW_GROUPS,
  SHARED_QUESTION_IDS,
} from "./reviewQuestions";
import "./LeaveReview.css";

const RATING_SCALE = [
  { stars: 1, en: "Very Poor", ar: "سيء جداً" },
  { stars: 2, en: "Poor", ar: "سيء" },
  { stars: 3, en: "Fair", ar: "مقبول" },
  { stars: 4, en: "Good", ar: "جيد" },
  { stars: 5, en: "Excellent", ar: "ممتاز" },
];

function LeaveReview() {
  const { courseId } = useParams();
  const isArabic = i18next.language === "ar";

  const { eligibility, loading, submitting, error, submitReview } =
    useLeaveReview(courseId);

  const [ratings, setRatings] = useState({});
  const [instructorRatings, setInstructorRatings] = useState({});
  const [overallComment, setOverallComment] = useState("");

  const instructors = eligibility?.instructors ?? [];
  const instructorQuestions = INSTRUCTOR_REVIEW_GROUP.questions;

  const allQuestionsRated = useMemo(() => {
    const sharedComplete = SHARED_QUESTION_IDS.every((id) => ratings[id] > 0);

    if (!instructors.length) {
      return (
        sharedComplete &&
        instructorQuestions.every((question) => ratings[question.id] > 0)
      );
    }

    const instructorsComplete = instructors.every((instructor) => {
      const currentRatings =
        instructorRatings[instructor.course_instructor_id] || {};

      return instructorQuestions.every(
        (question) => currentRatings[question.id] > 0
      );
    });

    return sharedComplete && instructorsComplete;
  }, [ratings, instructorRatings, instructors, instructorQuestions]);

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  const handleRatingChange = useCallback((questionId, value) => {
    setRatings((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleInstructorRatingChange = useCallback(
    (courseInstructorId, questionId, value) => {
      setInstructorRatings((prev) => ({
        ...prev,
        [courseInstructorId]: {
          ...(prev[courseInstructorId] || {}),
          [questionId]: value,
        },
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const instructor_ratings = instructors.length
        ? instructors.map((instructor) => ({
            course_instructor_id: instructor.course_instructor_id,
            ratings: instructorRatings[instructor.course_instructor_id] || {},
          }))
        : undefined;

      await submitReview({
        ratings,
        overallComment,
        instructor_ratings,
      });
    },
    [submitReview, ratings, overallComment, instructorRatings, instructors]
  );

  const getRatingLabel = useCallback(
    (starCount) => {
      const level = RATING_SCALE.find((item) => item.stars === starCount);
      if (!level) return "";
      return isArabic ? level.ar : level.en;
    },
    [isArabic]
  );

  const renderStars = (questionId, currentRating, onRatingChange, namePrefix = "") => {
    const fieldId = `${namePrefix}${questionId}`;

    return (
    <div className="lr-stars">
      {[5, 4, 3, 2, 1].map((star) => (
        <React.Fragment key={star}>
          <input
            type="radio"
            id={`${fieldId}-star-${star}`}
            name={`${fieldId}-rating`}
            value={star}
            checked={currentRating === star}
            onChange={() => onRatingChange(star)}
          />
          <label htmlFor={`${fieldId}-star-${star}`} title={`${star} stars`}>
            <i
              className={`bi ${currentRating >= star ? "bi-star-fill" : "bi-star"}`}
            ></i>
          </label>
        </React.Fragment>
      ))}
    </div>
    );
  };

  const renderScaleLegend = () => (
    <div className="lr-scale-hint">
      {RATING_SCALE.map(({ stars, en, ar }) => (
        <span key={stars} className="lr-scale-item">
          <span className="lr-scale-stars" aria-hidden="true">
            {Array.from({ length: stars }, (_, i) => (
              <i key={i} className="bi bi-star-fill" />
            ))}
          </span>
          <span className="lr-scale-label">{isArabic ? ar : en}</span>
        </span>
      ))}
    </div>
  );

  const renderQuestion = (
    question,
    currentRating,
    onRatingChange,
    namePrefix = ""
  ) => (
    <div key={`${namePrefix}${question.id}`} className="lr-question-item">
      <p className="lr-question-en">{question.en}</p>
      <p className="lr-question-ar" dir="rtl">
        {question.ar}
      </p>
      <div className="lr-rating-group">
        {renderStars(question.id, currentRating, onRatingChange, namePrefix)}
        {currentRating > 0 && (
          <span className="lr-rating-selected-label">
            {getRatingLabel(currentRating)}
          </span>
        )}
      </div>
    </div>
  );

  const renderQuestionGroup = (group) => (
    <div key={group.key} className="lr-card">
      <h2 className="lr-section-title">
        <i className={`bi ${group.icon}`}></i>
        {isArabic ? group.titleAr : group.titleEn}
      </h2>
      {renderScaleLegend()}
      <div className="lr-questions-list">
        {group.questions.map((question) =>
          renderQuestion(question, ratings[question.id] || 0, (value) =>
            handleRatingChange(question.id, value)
          )
        )}
      </div>
    </div>
  );

  const renderInstructorReviewSection = () => {
    if (!instructors.length) {
      return renderQuestionGroup(INSTRUCTOR_REVIEW_GROUP);
    }

    return (
      <div className="lr-card lr-instructor-review-card">
        <h2 className="lr-section-title">
          <i className={`bi ${INSTRUCTOR_REVIEW_GROUP.icon}`}></i>
          {isArabic
            ? instructors.length > 1
              ? "المجموعة 3: المحاضرون"
              : INSTRUCTOR_REVIEW_GROUP.titleAr
            : instructors.length > 1
              ? "Group 3: Instructors"
              : INSTRUCTOR_REVIEW_GROUP.titleEn}
        </h2>
        {renderScaleLegend()}

        {instructors.map((instructor) => (
          <div
            key={instructor.course_instructor_id || instructor.id}
            className="lr-instructor-block"
          >
            <h3 className="lr-instructor-block-title">
              <i className="bi bi-person-badge"></i>
              {isArabic ? "تقييم المحاضر:" : "Rate instructor:"}{" "}
              <span>{instructor.full_name || instructor.name}</span>
            </h3>
            <div className="lr-questions-list">
              {instructorQuestions.map((question) =>
                renderQuestion(
                  question,
                  instructorRatings[instructor.course_instructor_id]?.[
                    question.id
                  ] || 0,
                  (value) =>
                    handleInstructorRatingChange(
                      instructor.course_instructor_id,
                      question.id,
                      value
                    ),
                  `ci-${instructor.course_instructor_id}-`
                )
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="lr-page d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  return (
    <div className="lr-page" dir={isArabic ? "rtl" : "ltr"}>
      <Helmet>
        <title>
          {isArabic ? "اترك تقييمك | T-Square" : "Leave Your Review | T-Square"}
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="lr-hero">
        <div className="lr-hero-overlay" />
        <div className="lr-hero-body">
          <button onClick={handleBack} className="lr-breadcrumb-btn">
            <i
              className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
            ></i>
            {isArabic ? "العودة للكورس" : "Back to Course"}
          </button>
          <h1 className="lr-hero-title">
            {isArabic
              ? "تقييم الكورس والمحاضرين والسنتر"
              : "Course, Instructors & Center Review"}
          </h1>
          <p className="lr-hero-sub">
            {isArabic
              ? "ملاحظاتك تساعدنا على تحسين محتوى الكورسات، أداء المحاضرين، وتجربة السنتر والمنصة بشكل عام. بعد إرسال التقييم ستصبح شهادتك متاحة للتحميل."
              : "Your feedback helps us improve course content, instructor performance, and the overall center and platform experience. After submitting your review, your certificate will become available."}
          </p>
        </div>
      </section>

      <div className="container-fluid px-3 px-lg-4 mt-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="lr-body">
          <div className="lr-columns-grid">
            {SHARED_REVIEW_GROUPS.map(renderQuestionGroup)}
            {renderInstructorReviewSection()}
          </div>

          <div className="lr-card lr-overall-comment">
            <div className="lr-form-group">
              <label className="lr-label" htmlFor="overall-review-text">
                {isArabic ? "تعليقات إضافية" : "Additional Comments"}
              </label>
              <textarea
                id="overall-review-text"
                className="lr-textarea"
                rows={4}
                placeholder={
                  isArabic
                    ? "اكتب أي ملاحظات إضافية هنا..."
                    : "Write any additional feedback here..."
                }
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="lr-actions mb-4">
            <button
              type="submit"
              className="lr-btn-submit"
              disabled={!allQuestionsRated || submitting}
            >
              <i className="bi bi-send-fill"></i>
              {submitting
                ? isArabic
                  ? "جاري الإرسال..."
                  : "Submitting..."
                : isArabic
                  ? "إرسال التقييمات"
                  : "Submit Reviews"}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="lr-btn-cancel"
              disabled={submitting}
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveReview;
