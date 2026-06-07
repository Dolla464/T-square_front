import React, { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import i18next from "i18next";
import { toastSuccess } from "../../../../components/shared/Toaster/toaster";
import { useLeaveReview } from "../../hooks/useLeaveReview";
import "./LeaveReview.css";

/**
 * صفحة اترك تقييم - LeaveReview
 * تنقسم إلى ثلاثة أقسام تقييم رئيسية:
 * 1. تقييم الكورس (Course Review)
 * 2. تقييم المحاضر (Instructor Review)
 * 3. تقييم المنصة والسنتر (Platform & Center Review)
 */
function LeaveReview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("studentDashboard");
  const isArabic = i18next.language === "ar";

  // استدعاء الهوك الفارغ حسب الطلب
  const reviewHookData = useLeaveReview();

  // 1. حالات تقييم الكورس
  const [courseRating, setCourseRating] = useState(0);
  const [courseReviewText, setCourseReviewText] = useState("");

  // 2. حالات تقييم المحاضر
  const [instructorRating, setInstructorRating] = useState(0);
  const [instructorReviewText, setInstructorReviewText] = useState("");

  // 3. حالات تقييم المنصة والسنتر
  const [platformRating, setPlatformRating] = useState(0);
  const [platformReviewText, setPlatformReviewText] = useState("");

  const handleBack = useCallback(() => {
    navigate(`/student/course/${courseId}`);
  }, [navigate, courseId]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // إظهار توستر النجاح المبرمج مسبقاً
    toastSuccess(
      isArabic 
        ? "تم إرسال تقييماتك بنجاح! شكراً لك على مشاركة رأيك الصادق." 
        : "Your reviews have been submitted successfully! Thank you for sharing your honest feedback."
    );

    // توجيه الطالب للعودة لصفحة تفاصيل الكورس
    navigate(`/student/course/${courseId}`);
  }, [navigate, courseId, isArabic]);

  // دالة مساعدة لإنشاء نجوم التقييم
  const renderStars = (sectionKey, currentRating, onRatingChange) => {
    return (
      <div className="lr-stars">
        {[5, 4, 3, 2, 1].map((star) => (
          <React.Fragment key={star}>
            <input
              type="radio"
              id={`${sectionKey}-star-${star}`}
              name={`${sectionKey}-rating`}
              value={star}
              checked={currentRating === star}
              onChange={() => onRatingChange(star)}
            />
            <label htmlFor={`${sectionKey}-star-${star}`} title={`${star} stars`}>
              <i className={`bi ${currentRating >= star ? "bi-star-fill" : "bi-star"}`}></i>
            </label>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="lr-page" dir={isArabic ? "rtl" : "ltr"}>
      <Helmet>
        <title>
          {isArabic ? "اترك تقييمك | T-Square" : "Leave Your Review | T-Square"}
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* ── السكشن الأول: Hero Header ── */}
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

      {/* ── حاوية المحتوى الرئيسي للتقييمات ── */}
      <div className="container mt-4">
        <form onSubmit={handleSubmit} className="lr-body">
          
          {/* 1. كارت تقييم الكورس */}
          <div className="lr-card">
            <h2 className="lr-section-title">
              <i className="bi bi-journal-bookmark-fill"></i>
              {isArabic ? "أولاً: تقييم الكورس" : "1. Course Evaluation"}
            </h2>
            
            <div className="lr-rating-group">
              <span className="lr-rating-label">
                {isArabic ? "تقييم محتوى وجودة الكورس:" : "Course content & quality rating:"}
              </span>
              {renderStars("course", courseRating, setCourseRating)}
            </div>

            <div className="lr-form-group">
              <label className="lr-label" htmlFor="course-review-text">
                {isArabic ? "ما رأيك في محتوى الشرح والتطبيق العملي؟" : "What did you think of the instruction and practical tasks?"}
              </label>
              <textarea
                id="course-review-text"
                className="lr-textarea"
                rows={4}
                placeholder={isArabic ? "اكتب تفاصيل رأيك هنا..." : "Write your feedback details here..."}
                value={courseReviewText}
                onChange={(e) => setCourseReviewText(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 2. كارت تقييم المحاضر */}
          <div className="lr-card">
            <h2 className="lr-section-title">
              <i className="bi bi-person-badge-fill"></i>
              {isArabic ? "ثانياً: تقييم المحاضر" : "2. Instructor Evaluation"}
            </h2>

            <div className="lr-rating-group">
              <span className="lr-rating-label">
                {isArabic ? "تقييم أداء وتفاعل المحاضر:" : "Instructor performance & engagement rating:"}
              </span>
              {renderStars("instructor", instructorRating, setInstructorRating)}
            </div>

            <div className="lr-form-group">
              <label className="lr-label" htmlFor="instructor-review-text">
                {isArabic ? "ما رأيك في أسلوب شرح المحاضر ومساعدته للطلاب؟" : "What did you think of the instructor's delivery and support?"}
              </label>
              <textarea
                id="instructor-review-text"
                className="lr-textarea"
                rows={4}
                placeholder={isArabic ? "اكتب تفاصيل رأيك هنا..." : "Write your feedback details here..."}
                value={instructorReviewText}
                onChange={(e) => setInstructorReviewText(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 3. كارت تقييم السنتر والمنصة */}
          <div className="lr-card">
            <h2 className="lr-section-title">
              <i className="bi bi-building"></i>
              {isArabic ? "ثالثاً: تقييم السنتر والمنصة" : "3. Center & Platform Evaluation"}
            </h2>

            <div className="lr-rating-group">
              <span className="lr-rating-label">
                {isArabic ? "تقييم بيئة السنتر وتجربة المنصة:" : "Center environment & platform experience rating:"}
              </span>
              {renderStars("platform", platformRating, setPlatformRating)}
            </div>

            <div className="lr-form-group">
              <label className="lr-label" htmlFor="platform-review-text">
                {isArabic ? "ما رأيك في خدمات السنتر والتجربة التقنية داخل المنصة؟" : "What did you think of the center facilities and the platform's user experience?"}
              </label>
              <textarea
                id="platform-review-text"
                className="lr-textarea"
                rows={4}
                placeholder={isArabic ? "اكتب تفاصيل رأيك هنا..." : "Write your feedback details here..."}
                value={platformReviewText}
                onChange={(e) => setPlatformReviewText(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ── أزرار الإجراءات للنموذج بالكامل ── */}
          <div className="lr-actions mb-4">
            <button 
              type="submit" 
              className="lr-btn-submit" 
              disabled={courseRating === 0 || instructorRating === 0 || platformRating === 0}
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
