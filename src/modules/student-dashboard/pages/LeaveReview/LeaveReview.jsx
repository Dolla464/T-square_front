import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import { useLeaveReview } from "../../hooks/useLeaveReview";
import {
  INSTRUCTOR_REVIEW_GROUP,
  SHARED_REVIEW_GROUPS,
  SHARED_QUESTION_IDS,
} from "./reviewQuestions";
import "./LeaveReview.css";
import { isArabicLocale } from "../../../../utils/isArabicLocale";


const RATING_KEYS = [
  { stars: 1, key: "very_poor" },
  { stars: 2, key: "poor" },
  { stars: 3, key: "fair" },
  { stars: 4, key: "good" },
  { stars: 5, key: "excellent" },
];

function LeaveReview() {
  const { courseId } = useParams();
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = isArabicLocale(i18n.language);

  const { eligibility, loading, submitting, submitReview } =
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
      const level = RATING_KEYS.find((item) => item.stars === starCount);
      if (!level) return "";
      return t(`leave_review.rating.${level.key}`);
    },
    [t]
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
      {RATING_KEYS.map(({ stars, key }) => (
        <span key={stars} className="lr-scale-item">
          <span className="lr-scale-stars" aria-hidden="true">
            {Array.from({ length: stars }, (_, i) => (
              <i key={i} className="bi bi-star-fill" />
            ))}
          </span>
          <span className="lr-scale-label">{t(`leave_review.rating.${key}`)}</span>
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
          {instructors.length > 1
            ? t("leave_review.instructors_group")
            : isArabic
              ? INSTRUCTOR_REVIEW_GROUP.titleAr
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
              {t("leave_review.rate_instructor")}{" "}
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
          {t("leave_review.page_title")}
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
            {t("leave_review.back_to_course")}
          </button>
          <h1 className="lr-hero-title">
            {t("leave_review.hero_title")}
          </h1>
          <p className="lr-hero-sub">
            {t("leave_review.hero_sub")}
          </p>
        </div>
      </section>

      <div className="container-fluid px-3 px-lg-4 mt-4">
        <form onSubmit={handleSubmit} className="lr-body">
          <div className="lr-columns-grid">
            {SHARED_REVIEW_GROUPS.map(renderQuestionGroup)}
            {renderInstructorReviewSection()}
          </div>

          <div className="lr-card lr-overall-comment">
            <div className="lr-form-group">
              <label className="lr-label" htmlFor="overall-review-text">
                {t("leave_review.additional_comments")}
              </label>
              <textarea
                id="overall-review-text"
                className="lr-textarea"
                rows={4}
                placeholder={t("leave_review.comments_placeholder")}
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
                ? t("leave_review.submitting")
                : t("leave_review.submit")}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="lr-btn-cancel"
              disabled={submitting}
            >
              {t("leave_review.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveReview;
