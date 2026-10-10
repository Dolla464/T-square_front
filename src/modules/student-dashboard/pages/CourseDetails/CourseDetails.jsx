// صفحة تفاصيل الكورس — للمشترك فقط (لا يوجد سعر أو شراء)
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import i18next from "i18next";
import { useState, useEffect, useCallback, useRef } from "react";
import "./CourseDetails.css";
import { useCourseDetails } from "../../hooks/useCousrsesDetails";
import ForbiddenAccess from "../../../../components/shared/ForbiddenAccess";
import PendingEnrollmentBanner from "./PendingEnrollmentBanner";
import { getCourseInstructors } from "../../../../utils/courseInstructors";
import { Spinner } from "react-bootstrap";
import ProfileAvatar from "../../../../components/shared/ProfileAvatar/ProfileAvatar";
import { getAttendanceTypeLabel } from "../../../../utils/attendanceTypes";
import { isArabicLocale } from "../../../../utils/isArabicLocale";


/* ── دوال مساعدة ──────────────────────────────────────── */
const getLevelIcon = (level) => {
  const map = {
    beginner: "bi-bar-chart",
    intermediate: "bi-bar-chart-fill",
    advanced: "bi-graph-up-arrow",
  };
  return map[level] || "bi-bar-chart";
};

const STATUS_CLS = {
  in_progress: "cd-status-progress",
  completed: "cd-status-done",
  not_started: "cd-status-idle",
  pending_payment: "cd-status-pending",
};

const getLevelLabel = (level, t) => t(`course.level.${level}`, level);

const getStatusLabel = (status, t) => ({
  label: t(`course.status.${status}`, status),
  cls: STATUS_CLS[status] ?? "cd-status-idle",
});

const formatDuration = (seconds) => {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total <= 0) return null;
  const m = Math.floor(total / 60);
  const s = String(Math.floor(total % 60)).padStart(2, "0");
  return `${m}:${s}`;
};

const lessonHasVideo = (lesson) =>
  Boolean(lesson?.has_video || lesson?.video_source_type === "google_drive");

const isSessionGatedAttendance = (attendanceType) => attendanceType !== "online";

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
  const isArabic = isArabicLocale(i18next.language);

  const previewsSectionRef = useRef(null);

  const { courseData, loading, error, forbidden, notFound } = useCourseDetails(courseId);
  const [activeVideo, setActiveVideo] = useState(null);
  const [expandedLessonId, setExpandedLessonId] = useState(null);

  const scrollToPreviews = () => {
    previewsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessonId((current) =>
      String(current) === String(lessonId) ? null : lessonId,
    );
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
        <ForbiddenAccess backTo="/student/dashboard" backLabel={t("course.back_to_dashboard")} />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="cd-error">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <p>
          {notFound
            ? t("course.course_not_found")
            : error || t("course.failed_to_load")}
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
    enrollment, access_status, whatsapp_link,
  } = courseData;

  const instructors = getCourseInstructors(courseData);
  const isPendingPayment =
    access_status === "pending_payment" || enrollment?.status === "pending_payment";

  const statusInfo = getStatusLabel(
    isPendingPayment ? "pending_payment" : enrollment?.status,
    t,
  );
  const langFlag = language === "ar" ? "ar" : language === "en" ? "en" : "🌐";
  const isCompleted = enrollment?.status === "completed";
  const isSessionGated = isSessionGatedAttendance(enrollment?.attendance_type);
  const showLessonsWaitingGroup =
    !isPendingPayment && isSessionGated && !enrollment?.group_id;
  const showLessonsWaitingSession =
    !isPendingPayment &&
    isSessionGated &&
    enrollment?.group_id &&
    (!lessons || lessons.length === 0);
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
      return t("course.review_accepted");
    }
    if (reviewStatus === "rejected") {
      return t("course.review_rejected");
    }
    return t("course.review_pending");
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
                {statusInfo.label}
              </span>
            </div>

            <p className="cd-hero-sub">{short_description || description}</p>

            {!isPendingPayment && (
            <ul className="cd-meta-row">
              {duration_hours != null && (
              <li>
                <i className="bi bi-clock-fill"></i> {duration_hours}{" "}
                {t("course.hrs")}
              </li>
              )}
              {duration_weeks != null && (
              <li>
                <i className="bi bi-calendar3"></i> {duration_weeks}{" "}
                {t("course.wks")}
              </li>
              )}
              {level && (
              <li>
                <i className={`bi ${getLevelIcon(level)}`}></i>{" "}
                {getLevelLabel(level, t)}
              </li>
              )}
              {language && (
              <li>
                <span className="cd-lang-flag"></span>{" "}
                {language?.toUpperCase()}
              </li>
              )}
              {total_students != null && (
              <li>
                <i className="bi bi-people-fill"></i>{" "}
                {total_students?.toLocaleString()}
              </li>
              )}
              {!isPendingPayment && (
              <li>
                <i className="bi bi-mortarboard-fill"></i>{" "}
                {getAttendanceTypeLabel(enrollment?.attendance_type, t)}
              </li>
              )}
              {avg_rating != null && (
              <li>
                <i className="bi bi-star-fill cd-star"></i>
                {Number(avg_rating).toFixed(1)} ({total_reviews ?? 0})
              </li>
              )}
            </ul>
            )}

            {!isPendingPayment && tags?.length > 0 && (
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
                  {t("course.view_certificate")}
                </button>
              )}
              {isCompleted && !hasReview && (
                <button
                  onClick={handleReviewClick}
                  className="cd-btn-certificate"
                >
                  <i className="bi bi-file-earmark-text me-1"></i>
                  {t("course.leave_review_btn")}
                </button>
              )}
              {isCompleted && hasReview && (
                <span className="cd-review-status-badge">
                  <i className="bi bi-check-circle me-1"></i>
                  {getReviewStatusMessage()}
                </span>
              )}
              {!isPendingPayment && previews?.length > 0 && (
                <button onClick={scrollToPreviews} className="cd-btn-ghost">
                  <i className="bi bi-collection-play"></i>
                  {t("course.preview")}
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

      {isPendingPayment && (
        <div className="cd-body cd-body-pending">
          <PendingEnrollmentBanner
            courseTitle={title}
            whatsappLink={whatsapp_link}
          />
        </div>
      )}

      {/* ══════════════════ BODY ══════════════════ */}
      <div className="cd-body">
        {/* ── عن الكورس ── */}
        {!isPendingPayment && description && (
          <section className="cd-card cd-description">
            <h2 className="cd-section-title">
              <i className="bi bi-file-text-fill"></i>
              {t("course.about_course")}
            </h2>
            <p className="cd-desc-body">{description}</p>
          </section>
        )}

        {/* ── ما ستتعلمه ── */}
        {!isPendingPayment && learnings?.length > 0 && (
          <section className="cd-card cd-learnings">
            <h2 className="cd-section-title">
              <i className="bi bi-lightbulb-fill"></i>
              {t("course.what_you_learn")}
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

        {/* ── دروس الكورس: حالات الانتظار ── */}
        {showLessonsWaitingGroup && (
          <section className="cd-card cd-lessons cd-lessons--empty">
            <h2 className="cd-section-title">
              <i className="bi bi-play-btn-fill"></i>
              {t("course.lessons_section_title")}
            </h2>
            <p className="cd-lessons-empty-message mb-0">
              {t("course.lessons_waiting_group")}
            </p>
          </section>
        )}

        {showLessonsWaitingSession && (
          <section className="cd-card cd-lessons cd-lessons--empty">
            <h2 className="cd-section-title">
              <i className="bi bi-play-btn-fill"></i>
              {t("course.lessons_section_title")}
            </h2>
            <p className="cd-lessons-empty-message mb-0">
              {t("course.lessons_waiting_session")}
            </p>
          </section>
        )}

        {/* ── دروس الكورس ── */}
        {!isPendingPayment && lessons?.length > 0 && (
          <section className="cd-card cd-lessons">
            <h2 className="cd-section-title">
              <i className="bi bi-play-btn-fill"></i>
              {t("course.lessons_section_title")}
            </h2>
            <div className="cd-lessons-grid">
              {lessons.map((lesson) => {
                const isExpanded = String(expandedLessonId) === String(lesson.id);
                const duration = formatDuration(lesson.duration_seconds);
                const hasVideo = lessonHasVideo(lesson);

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
                          {duration ? (
                            <span className="cd-lesson-duration">
                              <i className="bi bi-clock"></i>
                              {duration} {t("course.min")}
                            </span>
                          ) : hasVideo ? (
                            <span className="cd-lesson-badge">
                              <i className="bi bi-camera-video"></i>
                              {t("course.video_available")}
                            </span>
                          ) : null}
                        </div>

                        {hasVideo && (
                          <Link
                            to={`/student/course/${courseId}/lesson/${lesson.id}`}
                            className="cd-lesson-watch-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <i className="bi bi-play-circle-fill"></i>
                            {t("course.watch_lesson")}
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
        {!isPendingPayment && previews?.length > 0 && (
          <section ref={previewsSectionRef} className="cd-card cd-previews">
            <h2 className="cd-section-title">
              <i className="bi bi-collection-play-fill"></i>
              {t("course.course_preview")}
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
                        {t("course.min")}
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
              {instructors.length > 1
                ? t("course.about_instructors")
                : t("course.about_the_instructor")}
            </h2>

            <div className="cd-instructors-grid">
              {instructors.map((instructorItem) => (
                <article
                  className="cd-card cd-instructor-card"
                  key={instructorItem.course_instructor_id || instructorItem.id}
                >
                  <div className="cd-instructor-row">
                    <div className="cd-avatar-wrap">
                      <ProfileAvatar
                        name={instructorItem.full_name}
                        avatarUrl={instructorItem.avatar}
                        size={80}
                        className="cd-avatar-profile"
                      />
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
                              {t("course.chat_whatsapp")}
                            </a>
                          </p>
                        </>
                      )}

                      {instructorItem.bio && (
                        <div className="cd-instructor-bio-wrap">
                          <p className="cd-instructor-bio-label">
                            <i className="bi bi-file-person-fill cd-instructor-key-icon"></i>
                            {t("course.bio")}
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
