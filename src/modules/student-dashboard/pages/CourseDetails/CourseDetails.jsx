// صفحة تفاصيل الكورس — للمشترك فقط (لا يوجد سعر أو شراء)
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import i18next from "i18next";
import { useState, useEffect, useCallback } from "react";
import "./CourseDetails.css";
import { useCourseDetails } from "../../hooks/useCousrsesDetails";
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

const getStatusLabel = (status, isArabic) => {
  const map = {
    in_progress: { ar: "جاري التعلم", en: "In Progress", cls: "cd-status-progress" },
    completed: { ar: "مكتمل", en: "Completed", cls: "cd-status-done" },
    not_started: { ar: "لم يبدأ", en: "Not Started", cls: "cd-status-idle" },
  };
  return map[status] ?? { ar: status, en: status, cls: "cd-status-idle" };
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

/* ════════════════════════════════════════════
   Lightbox — مشغّل فيديو مدمج
════════════════════════════════════════════ */
function VideoLightbox({ video, onClose }) {
  const handleBackdrop = useCallback(
    (e) => { if (e.target === e.currentTarget) onClose(); },
    [onClose]
  );

  /* إغلاق بـ Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* منع scroll الخلفية */
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
  const { courseId } = useParams();
  const { t } = useTranslation("studentDashboard");
  const isArabic = i18next.language === "ar";

  const { courseData, loading, error } = useCourseDetails(courseId);
  const [activeVideo, setActiveVideo] = useState(null); // الفيديو المفتوح في lightbox

  const handleDrive = () => {
    if (courseData?.google_drive_link) window.open(courseData.google_drive_link);
  };

  /* ── شاشة التحميل ── */
  if (loading) {
    return (
      <div className="cd-page d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  /* ── شاشة الخطأ ── */
  if (error || !courseData) {
    return (
      <div className="cd-error">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <p>{error || (isArabic ? "تعذّر تحميل الكورس" : "Course not found")}</p>
      </div>
    );
  }

  const {
    title, short_description, description,
    thumbnail,
    level, language,
    duration_hours, duration_weeks,
    avg_rating, total_reviews, total_students,
    instructor, category, tags, learnings, previews,
    enrollment,
    google_drive_link,
  } = courseData;

  const statusInfo = getStatusLabel(enrollment?.status, isArabic);
  const langFlag = language === "ar" ? "ar" : language === "en" ? "en" : "🌐";

  return (
    <div className="cd-page" dir={isArabic ? "rtl" : "ltr"}>
      <Helmet>
        <title>{title ? `${title} | T-Square` : `${t("course.details_title")} | T-Square`}</title>
      </Helmet>

      {/* ══ Video Lightbox ══ */}
      {activeVideo && (
        <VideoLightbox video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}

      {/* ══════════════════ HERO ══════════════════ */}
      <section
        className="cd-hero"
      >
        <div className="cd-hero-overlay" />

        <div className="cd-hero-body d-flex align-items-center">
          {/* الجانب الأيسر — المحتوى */}
          <div className="cd-hero-left">

            {/* Category + Status — solid badges */}
            <div className="cd-breadcrumb">
              {category && (
                <span className="cd-chip cd-chip-cat">{category.name}</span>
              )}
              <span className={`cd-chip ${statusInfo.cls}`}>
                {isArabic ? statusInfo.ar : statusInfo.en}
              </span>
            </div>

            <h1 className="cd-hero-title">{title}</h1>
            <p className="cd-hero-sub">{short_description || description}</p>

            {/* Meta strip */}
            <ul className="cd-meta-row">
              <li><i className="bi bi-clock-fill"></i> {duration_hours} {isArabic ? "ساعة" : "hrs"}</li>
              <li><i className="bi bi-calendar3"></i> {duration_weeks} {isArabic ? "أسبوع" : "wks"}</li>
              <li><i className={`bi ${getLevelIcon(level)}`}></i> {getLevelLabel(level, isArabic)}</li>
              <li><span className="cd-lang-flag">{langFlag}</span> {language?.toUpperCase()}</li>
              <li><i className="bi bi-people-fill"></i> {total_students?.toLocaleString()}</li>
              <li>
                <i className="bi bi-star-fill cd-star"></i>
                {Number(avg_rating).toFixed(1)} ({total_reviews})
              </li>
            </ul>

            {/* Tags */}
            {tags?.length > 0 && (
              <div className="cd-tags">
                {tags.map((tag) => (
                  <span key={tag.id} className="cd-tag">{tag.name}</span>
                ))}
              </div>
            )}

            {/* أزرار الإجراء */}
            <div className="cd-hero-actions">
              {google_drive_link && (
                <button onClick={handleDrive} className="cd-btn-primary">
                  <i className="bi bi-play-circle-fill"></i>
                  {isArabic ? "متابعة التعلم" : "Continue Learning"}
                </button>
              )}
              {previews?.length > 0 && (
                <button
                  onClick={() => setActiveVideo(previews[0])}
                  className="cd-btn-ghost"
                >
                  <i className="bi bi-collection-play"></i>
                  {isArabic ? "معاينة الكورس" : "Preview"}
                </button>
              )}
            </div>
          </div>

          {/* الجانب الأيمن — Thumbnail */}
          {thumbnail && (
            <div className="cd-hero-right ">
              <div className="cd-thumb-wrap">
                <img src={thumbnail} alt={title} className="cd-thumb" loading="lazy" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════ BODY ══════════════════ */}
      <div className="cd-body">

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
                  <span className="cd-check"><i className="bi bi-check-lg"></i></span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── تفاصيل الكورس ── */}
        <section className="cd-card cd-info-grid">
          <h2 className="cd-section-title">
            <i className="bi bi-info-circle-fill"></i>
            {isArabic ? "تفاصيل الكورس" : "Course Details"}
          </h2>
          <div className="cd-info-cells">
            <div className="cd-info-cell">
              <span className="cd-info-label">{isArabic ? "المستوى" : "Level"}</span>
              <span className="cd-info-val">{getLevelLabel(level, isArabic)}</span>
            </div>
            <div className="cd-info-cell">
              <span className="cd-info-label">{isArabic ? "اللغة" : "Language"}</span>
              <span className="cd-info-val"> {language?.toUpperCase()}</span>
            </div>
            <div className="cd-info-cell">
              <span className="cd-info-label">{isArabic ? "المدة" : "Duration"}</span>
              <span className="cd-info-val">
                {duration_hours} {isArabic ? "ساعة" : "hrs"} / {duration_weeks} {isArabic ? "أسبوع" : "wks"}
              </span>
            </div>


            <div className="cd-info-cell">
              <span className="cd-info-label">{isArabic ? "التصنيف" : "Category"}</span>
              <span className="cd-info-val">{category?.name ?? "—"}</span>
            </div>
          </div>
        </section>

        {/* ── وصف الكورس ── */}
        {description && (
          <section className="cd-card cd-description">
            <h2 className="cd-section-title">
              <i className="bi bi-file-text-fill"></i>
              {isArabic ? "عن الكورس" : "About this Course"}
            </h2>
            <p className="cd-desc-body">{description}</p>
          </section>
        )}

        {/* ── معاينة الفيديو — lightbox ── */}
        {previews?.length > 0 && (
          <section className="cd-card cd-previews">
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

        {/* ── المدرب ── */}
        {instructor && (
          <section className="cd-card cd-instructor">
            <h2 className="cd-section-title">
              <i className="bi bi-person-badge-fill"></i>
              {isArabic ? "عن المدرب" : "About the Instructor"}
            </h2>

            <div className="cd-instructor-row">
              {/* Avatar */}
              <div className="cd-avatar-wrap">
                {instructor.avatar && !instructor.avatar.includes("default_avatar") ? (
                  <img
                    src={instructor.avatar}
                    alt={instructor.full_name}
                    className="cd-avatar-img"
                  />
                ) : (
                  <div className="cd-avatar-placeholder">
                    {getInitials(instructor.full_name)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="cd-instructor-info">
                {/* الاسم */}
                <h3 className="cd-instructor-name">
                  <i className="bi bi-person-fill cd-instructor-key-icon"></i>
                  {instructor.full_name}
                </h3>

                {/* التخصص */}
                {instructor.field && (
                  <p className="cd-instructor-meta-item">
                    <i className="bi bi-briefcase-fill cd-instructor-key-icon"></i>
                    {instructor.field}
                  </p>
                )}

                {/* رقم الهاتف */}
                {instructor.phone && (
                  <>
                    <p className="cd-instructor-meta-item">
                      <i className="bi bi-telephone-fill cd-instructor-key-icon"></i>
                      <a href={`tel:${instructor.phone}`} className="cd-instructor-phone">
                        {instructor.phone}
                      </a>
                    </p>
                    <p className="cd-instructor-meta-item">
                      <i className="bi bi-whatsapp cd-instructor-key-icon cd-instructor-whatsapp-icon"></i>
                      <a
                        href={`https://wa.me/${instructor.phone.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="cd-instructor-whatsapp"
                      >
                        {isArabic ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
                      </a>
                    </p>
                  </>
                )}

                {/* السيرة الذاتية */}
                {instructor.bio && (
                  <div className="cd-instructor-bio-wrap">
                    <p className="cd-instructor-bio-label">
                      <i className="bi bi-file-person-fill cd-instructor-key-icon"></i>
                      {isArabic ? "نبذة تعريفية" : "Bio"}
                    </p>
                    <p className="cd-instructor-bio">{instructor.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

export default CourseDetails;
