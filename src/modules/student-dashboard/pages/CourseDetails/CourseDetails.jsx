// صفحة تفاصيل الكورس — للمشترك فقط (لا يوجد سعر أو شراء)
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import i18next from "i18next";
import { useState, useEffect, useCallback, useRef } from "react";
import "./CourseDetails.css";
import { useCourseDetails } from "../../hooks/useCousrsesDetails";
import ForbiddenAccess from "../../../../components/shared/ForbiddenAccess";
import { getCourseInstructors } from "../../../../utils/courseInstructors";
import { Spinner } from "react-bootstrap";

/* ── دوال مساعدة ──────────────────────────────────────── */
const getLevelIcon = (level) => {
  const map = {
    beginner: "bi-bar-chart",
    intermediate: "bi-bar-chart-fill",
    advanced: "bi-graph-up-arrow",
  };
  return map[level] || "bi-bar-chart";
};

const getLevelLabel = (level, isArabic) => {
  const map = {
    beginner: { ar: "مبتدئ", en: "Beginner" },
    intermediate: { ar: "متوسط", en: "Intermediate" },
    advanced: { ar: "متقدم", en: "Advanced" },
  };
  return map[level]?.[isArabic ? "ar" : "en"] ?? level;
};

const getStatusLabel = (status) => {
  const map = {
    in_progress: { ar: "جاري التعلم", en: "In Progress", cls: "cd-status-progress" },
    completed: { ar: "مكتمل", en: "Completed", cls: "cd-status-done" },
    not_started: { ar: "لم يبدأ", en: "Not Started", cls: "cd-status-idle" },
  };
  return map[status] ?? { ar: status, en: status, cls: "cd-status-idle" };
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const formatDuration = (seconds) => {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

/* ════════════════════════════════════════════
   Lightbox — مشغّل فيديو مدمج
════════════════════════════════════════════ */
function VideoLightbox({ video, onClose }) {
  const handleBackdrop = useCallback(
    (e) => { if (e.target === e.currentTarget) onClose(); },
    [onClose]
  );

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="cd-lightbox-backdrop" onClick={handleBackdrop}>
      <div className="cd-lightbox-card">
        <button className="cd-lightbox-close" onClick={onClose} aria-label="Close">
          <i className="bi bi-x-lg"></i>
        </button>
        <p className="cd-lightbox-title">{video.title}</p>
        <div className="cd-lightbox-video-wrap">
          <video
            src={video.video_url}
            controls
            autoPlay
            className="cd-lightbox-video"
          />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   الصفحة الرئيسية
════════════════════════════════════════════ */
function CourseDetails() {
  const navigate = useNavigate();

  const { courseId } = useParams();
  const { t } = useTranslation("studentDashboard");
  const isArabic = i18next.language === "ar";

  const previewsSectionRef = useRef(null);

  const { courseData, loading, error, forbidden, notFound } = useCourseDetails(courseId);
  const [activeVideo, setActiveVideo] = useState(null);
  const [expandedLessonId, setExpandedLessonId] = useState(null);

  const scrollToPreviews = () => {
    previewsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessonId((current) => (current === lessonId ? null : lessonId));
  };

  if (loading) {
    return (
      <div className="cd-page d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="cd-page">
        <ForbiddenAccess backTo="/student/dashboard" backLabel={isArabic ? "العودة للوحة الطالب" : "Back to dashboard"} />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="cd-error">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <p>
          {notFound
            ? (isArabic ? "الكورس غير موجود" : "Course not found")
            : error || (isArabic ? "تعذّر تحميل الكورس" : "Failed to load course")}
        </p>
      </div>
    );
  }

  const {
    title, short_description, description,
    cover_image,
    level, language,
    duration_hours, duration_weeks,
    avg_rating, total_reviews, total_students,
    category, tags, learnings, previews, lessons,
    enrollment,
  } = courseData;

  const instructors = getCourseInstructors(courseData);

  const statusInfo = getStatusLabel(enrollment?.status, isArabic);
  const langFlag = language === "ar" ? "ar" : language === "en" ? "en" : "🌐";
  const isCompleted = enrollment?.status === "completed";
  const hasReview = enrollment?.has_review === true;
  const certificateAvailable = enrollment?.certificate_available === true;
  const reviewStatus = enrollment?.review_status;

  const handleCertificateClick = () => {
    navigate("/student/certificates");
  };
  const handleReviewClick = () => {
    navigate(`/student/review/${courseId}`);
  };

  const getReviewStatusMessage = () => {
    if (!hasReview) return null;
    if (reviewStatus === "accepted") {
      return isArabic ? "تم قبول تقييمك" : "Your review has been accepted";
    }
    if (reviewStatus === "rejected") {
      return isArabic ? "تم رفض تقييمك" : "Your review was rejected";
    }
    return isArabic ? "تم إرسال تقييمك وهو قيد المراجعة" : "Your review has been submitted and is pending approval";
  };

  return (
    <div className="cd-page" dir={isArabic ? "rtl" : "ltr"}>
      <Helmet>
        <title>
          {title
            ? `${title} | T-Square`
            : `${t("course.details_title")} | T-Square`}
        </title>
      </Helmet>

      {activeVideo && (
        <VideoLightbox
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="cd-hero">
        <div className="cd-hero-overlay" />

        <div className="cd-hero-body d-flex align-items-center">
          <div className="cd-hero-left">
            <h1 className="cd-hero-title">{title}</h1>

            <div className="cd-breadcrumb">
              {category && (
                <span className="cd-chip cd-chip-cat">{category.name}</span>
              )}
              <span className={`cd-chip ${statusInfo.cls}`}>
                {isArabic ? statusInfo.ar : statusInfo.en}
              </span>
            </div>

            <p className="cd-hero-sub">{short_description || description}</p>

            <ul className="cd-meta-row">
              <li>
                <i className="bi bi-clock-fill"></i> {duration_hours}{" "}
                {isArabic ? "ساعة" : "hrs"}
              </li>
              <li>
                <i className="bi bi-calendar3"></i> {duration_weeks}{" "}
                {isArabic ? "أسبوع" : "wks"}
              </li>
              <li>
                <i className={`bi ${getLevelIcon(level)}`}></i>{" "}
                {getLevelLabel(level, isArabic)}
              </li>
              <li>
                <span className="cd-lang-flag">{langFlag}</span>{" "}
                {language?.toUpperCase()}
              </li>
              <li>
                <i className="bi bi-people-fill"></i>{" "}
                {total_students?.toLocaleString()}
              </li>
              <li>
                <i className="bi bi-star-fill cd-star"></i>
                {Number(avg_rating).toFixed(1)} ({total_reviews})
              </li>
            </ul>

            {tags?.length > 0 && (
              <div className="cd-tags">
                {tags.map((tag) => (
                  <span key={tag.id} className="cd-tag">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="cd-hero-actions">
              {isCompleted && certificateAvailable && (
                <button
                  onClick={handleCertificateClick}
                  className="cd-btn-certificate"
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i>
                  {isArabic ? "عرض الشهادة" : "View Certificate"}
                </button>
              )}
              {isCompleted && !hasReview && (
                <button
                  onClick={handleReviewClick}
                  className="cd-btn-certificate"
                >
                  <i className="bi bi-file-earmark-text me-1"></i>
                  {isArabic ? "اترك تقييم" : "Leave Review"}
                </button>
              )}
              {isCompleted && hasReview && (
                <span className="cd-review-status-badge">
                  <i className="bi bi-check-circle me-1"></i>
                  {getReviewStatusMessage()}
                </span>
              )}
              {previews?.length > 0 && (
                <button onClick={scrollToPreviews} className="cd-btn-ghost">
                  <i className="bi bi-collection-play"></i>
                  {isArabic ? "معاينة الكورس" : "Preview"}
                </button>
              )}
            </div>
          </div>

          {cover_image && (
            <div className="cd-hero-right">
              <div className="cd-thumb-wrap">
                <img
                  src={cover_image}
                  alt={title}
                  className="cd-thumb"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ BODY ══════════════════ */}
      <div className="cd-body">
        {/* ── عن الكورس ── */}
        {description && (
          <section className="cd-card cd-description">
            <h2 className="cd-section-title">
              <i className="bi bi-file-text-fill"></i>
              {isArabic ? "عن الكورس" : "About this Course"}
            </h2>
            <p className="cd-desc-body">{description}</p>
          </section>
        )}

        {/* ── ما ستتعلمه ── */}
        {learnings?.length > 0 && (
          <section className="cd-card cd-learnings">
            <h2 className="cd-section-title">
              <i className="bi bi-lightbulb-fill"></i>
              {isArabic ? "ماذا ستتعلم" : "What You'll Learn"}
            </h2>
            <ul className="cd-learnings-list">
              {learnings.map((item, i) => (
                <li key={i} className="cd-learning-item">
                  <span className="cd-check">
                    <i className="bi bi-check-lg"></i>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── دروس الكورس ── */}
        {lessons?.length > 0 && (
          <section className="cd-card cd-lessons">
            <h2 className="cd-section-title">
              <i className="bi bi-play-btn-fill"></i>
              {isArabic ? "دروس الكورس" : "Course Lessons"}
            </h2>
            <div className="cd-lessons-grid">
              {lessons.map((lesson) => {
                const isExpanded = expandedLessonId === lesson.id;
                const duration = formatDuration(lesson.duration_seconds);

                return (
                  <div
                    key={lesson.id}
                    className={`cd-lesson-item${isExpanded ? " cd-lesson-item--expanded" : ""}`}
                  >
                    <button
                      type="button"
                      className="cd-lesson-toggle"
                      onClick={() => toggleLesson(lesson.id)}
                      aria-expanded={isExpanded}
                    >
                      <span className="cd-lesson-toggle-title">{lesson.title}</span>
                      <i className={`bi bi-chevron-${isExpanded ? "up" : "down"} cd-lesson-chevron`}></i>
                    </button>

                    {isExpanded && (
                      <div className="cd-lesson-details">
                        {lesson.description && (
                          <p className="cd-lesson-description">{lesson.description}</p>
                        )}

                        <div className="cd-lesson-meta">
                          {duration && (
                            <span className="cd-lesson-duration">
                              <i className="bi bi-clock"></i>
                              {duration} {isArabic ? "دقيقة" : "min"}
                            </span>
                          )}
                          {!duration && lesson.has_video && (
                            <span className="cd-lesson-badge">
                              <i className="bi bi-camera-video"></i>
                              {isArabic ? "فيديو متاح" : "Video available"}
                            </span>
                          )}
                        </div>

                        {lesson.has_video && (
                          <Link
                            to={`/student/course/${courseId}/lesson/${lesson.id}`}
                            className="cd-lesson-watch-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="bi bi-play-circle-fill"></i>
                            {isArabic ? "مشاهدة الدرس" : "Watch Lesson"}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── معاينة الفيديو — lightbox ── */}
        {previews?.length > 0 && (
          <section ref={previewsSectionRef} className="cd-card cd-previews">
            <h2 className="cd-section-title">
              <i className="bi bi-collection-play-fill"></i>
              {isArabic ? "معاينة الكورس" : "Course Preview"}
            </h2>
            <div className="cd-preview-list">
              {previews.map((pv) => (
                <button
                  key={pv.id}
                  onClick={() => setActiveVideo(pv)}
                  className="cd-preview-item"
                >
                  <div className="cd-preview-icon">
                    <i className="bi bi-play-fill"></i>
                  </div>
                  <div className="cd-preview-info">
                    <span className="cd-preview-title">{pv.title}</span>
                    {pv.duration_seconds && (
                      <span className="cd-preview-dur">
                        {Math.floor(pv.duration_seconds / 60)}:
                        {String(pv.duration_seconds % 60).padStart(2, "0")}{" "}
                        {isArabic ? "دقيقة" : "min"}
                      </span>
                    )}
                  </div>
                  <i className="bi bi-fullscreen cd-preview-ext"></i>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── المدربون ── */}
        {instructors.length > 0 && (
          <section className="cd-instructors-section">
            <h2 className="cd-section-title">
              <i className="bi bi-person-badge-fill"></i>
              {isArabic
                ? instructors.length > 1
                  ? "عن المدربين"
                  : "عن المدرب"
                : instructors.length > 1
                  ? "About the Instructors"
                  : "About the Instructor"}
            </h2>

            <div className="cd-instructors-grid">
              {instructors.map((instructorItem) => (
                <article
                  className="cd-card cd-instructor-card"
                  key={instructorItem.course_instructor_id || instructorItem.id}
                >
                  <div className="cd-instructor-row">
                    <div className="cd-avatar-wrap">
                      {instructorItem.avatar &&
                      !instructorItem.avatar.includes("default_avatar") ? (
                        <img
                          src={instructorItem.avatar}
                          alt={instructorItem.full_name}
                          className="cd-avatar-img"
                        />
                      ) : (
                        <div className="cd-avatar-placeholder">
                          {getInitials(instructorItem.full_name)}
                        </div>
                      )}
                    </div>

                    <div className="cd-instructor-info">
                      <h3 className="cd-instructor-name">
                        <i className="bi bi-person-fill cd-instructor-key-icon"></i>
                        {instructorItem.full_name}
                      </h3>

                      {instructorItem.field && (
                        <p className="cd-instructor-meta-item">
                          <i className="bi bi-briefcase-fill cd-instructor-key-icon"></i>
                          {instructorItem.field}
                        </p>
                      )}

                      {instructorItem.phone && (
                        <>
                          <p className="cd-instructor-meta-item">
                            <i className="bi bi-telephone-fill cd-instructor-key-icon"></i>
                            <a
                              href={`tel:${instructorItem.phone}`}
                              className="cd-instructor-phone"
                            >
                              {instructorItem.phone}
                            </a>
                          </p>
                          <p className="cd-instructor-meta-item">
                            <i className="bi bi-whatsapp cd-instructor-key-icon cd-instructor-whatsapp-icon"></i>
                            <a
                              href={`https://wa.me/${instructorItem.phone.replace(/[^\d]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="cd-instructor-whatsapp"
                            >
                              {isArabic ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
                            </a>
                          </p>
                        </>
                      )}

                      {instructorItem.bio && (
                        <div className="cd-instructor-bio-wrap">
                          <p className="cd-instructor-bio-label">
                            <i className="bi bi-file-person-fill cd-instructor-key-icon"></i>
                            {isArabic ? "نبذة تعريفية" : "Bio"}
                          </p>
                          <p className="cd-instructor-bio">{instructorItem.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default CourseDetails;
