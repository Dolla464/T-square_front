import React, { useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import i18next from "i18next";
import { toastSuccess } from "../../../../components/shared/Toaster/toaster";
import { useLeaveReview } from "../../hooks/useLeaveReview";
import { ALL_QUESTION_IDS, REVIEW_GROUPS } from "./reviewQuestions";
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
  const navigate = useNavigate();
  const isArabic = i18next.language === "ar";

  useLeaveReview();

  const [ratings, setRatings] = useState({});
  const [overallComment, setOverallComment] = useState("");

  const allQuestionsRated = useMemo(
    () => ALL_QUESTION_IDS.every((id) => ratings[id] > 0),
    [ratings]
  );

  const handleBack = useCallback(() => {
    navigate(`/student/course/${courseId}`);
  }, [navigate, courseId]);

  const handleRatingChange = useCallback((questionId, value) => {
    setRatings((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      toastSuccess(
        isArabic
          ? "تم إرسال تقييماتك بنجاح! شكراً لك على مشاركة رأيك الصادق."
          : "Your reviews have been submitted successfully! Thank you for sharing your honest feedback."
      );

      navigate(`/student/course/${courseId}`);
    },
    [navigate, courseId, isArabic]
  );

  const getRatingLabel = useCallback(
    (starCount) => {
      const level = RATING_SCALE.find((item) => item.stars === starCount);
      if (!level) return "";
      return isArabic ? level.ar : level.en;
    },
    [isArabic]
  );

  const renderStars = (questionId, currentRating, onRatingChange) => (
    <div className="lr-stars">
      {[5, 4, 3, 2, 1].map((star) => (
        <React.Fragment key={star}>
          <input
            type="radio"
            id={`${questionId}-star-${star}`}
            name={`${questionId}-rating`}
            value={star}
            checked={currentRating === star}
            onChange={() => onRatingChange(star)}
          />
          <label htmlFor={`${questionId}-star-${star}`} title={`${star} stars`}>
            <i className={`bi ${currentRating >= star ? "bi-star-fill" : "bi-star"}`}></i>
          </label>
        </React.Fragment>
      ))}
    </div>
  );

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

  const renderQuestion = (question) => {
    const currentRating = ratings[question.id] || 0;

    return (
    <div key={question.id} className="lr-question-item">
      <p className="lr-question-en">{question.en}</p>
      <p className="lr-question-ar" dir="rtl">
        {question.ar}
      </p>
      <div className="lr-rating-group">
        {renderStars(question.id, currentRating, (value) =>
          handleRatingChange(question.id, value)
        )}
        {currentRating > 0 && (
          <span className="lr-rating-selected-label">
            {getRatingLabel(currentRating)}
          </span>
        )}
      </div>
    </div>
    );
  };

  const renderQuestionGroup = (group) => (
    <div key={group.key} className="lr-card">
      <h2 className="lr-section-title">
        <i className={`bi ${group.icon}`}></i>
        {isArabic ? group.titleAr : group.titleEn}
      </h2>
      {renderScaleLegend()}
      <div className="lr-questions-list">
        {group.questions.map(renderQuestion)}
      </div>
    </div>
  );

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
            <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}></i>
            {isArabic ? "العودة للكورس" : "Back to Course"}
          </button>
          <h1 className="lr-hero-title">
            {isArabic ? "تقييم الكورس والمحاضر والسنتر" : "Course, Instructor & Center Review"}
          </h1>
          <p className="lr-hero-sub">
            {isArabic
              ? "ملاحظاتك تساعدنا على تحسين محتوى الكورسات، أداء المحاضرين، وتجربة السنتر والمنصة بشكل عام."
              : "Your feedback helps us improve course content, instructor performance, and the overall center and platform experience."}
          </p>
        </div>
      </section>

      <div className="container mt-4">
        <form onSubmit={handleSubmit} className="lr-body">
          {REVIEW_GROUPS.map(renderQuestionGroup)}

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
              disabled={!allQuestionsRated}
            >
              <i className="bi bi-send-fill"></i>
              {isArabic ? "إرسال التقييمات" : "Submit Reviews"}
            </button>
            <button type="button" onClick={handleBack} className="lr-btn-cancel">
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveReview;
