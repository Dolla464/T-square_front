import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Spinner } from "react-bootstrap";
import { FaPlay } from "react-icons/fa";
import { useRef } from "react";
import VideoPreviewModal from "../../components/layout/VideoPreviewModal";

const CourseVideos = ({ course }) => {
  const { t, i18n } = useTranslation("coursesDetails");
  const isArabic = i18n?.language === "ar";

  // استخراج قائمة فيديوهات المعاينة من بيانات الكورس
  const previews = course?.previews;

  // حالة لتخزين الفيديو النشط الذي يتم تشغيله حالياً في المودال
  const [activeVideo, setActiveVideo] = useState(null);

  const videoRef = useRef(null);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setActiveVideo(null);
  };

  // 1. حالة التحميل: إذا كانت بيانات الكورس غير متوفرة بعد أو لم يتم تحميلها
  if (!course || previews === undefined) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // 2. حالة عدم وجود بيانات: إذا كانت قائمة فيديوهات المعاينة فارغة
  if (!Array.isArray(previews) || previews.length === 0) {
    return (
      <div
        className="mt-5 text-center text-lg-end"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <h3 className="fw-bold mb-3">{t("course_preview")}</h3>
        <p className="text-muted mb-4 fs-5">{t("preview_description")}</p>
        <div className="alert alert-info border-0 shadow-sm rounded-4 py-4 text-center">
          <p className="mb-0 fs-5 fw-semibold">{t("no_videos")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mt-5 text-center text-lg-end"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* ستايل مخصص للمودال لضمان التوافق وحفظ التصميم الأصلي عبر الشاشات المختلفة */}
      <style>{`
        .custom-preview-modal {
          max-width: 50% !important;
        }
        @media (max-width: 767px) {
          .custom-preview-modal {
            max-width: 95% !important;
          }
        }
      `}</style>

      <h3 className="fw-bold mb-3">{t("course_preview")}</h3>
      <p className="text-muted mb-4 fs-5">{t("preview_description")}</p>

      <div className="row g-4">
        {previews.map((preview, index) => {
          const videoUrl = preview.video_url;
          // "https://images.unsplash.com/photo-1498050108023-c5249f4df085";

          return (
            <div className="col-lg-4 col-md-6" key={preview.id || index}>
              <div className="card border-0 shadow rounded-4 overflow-hidden h-100">
                {/* عنوان الفيديو */}
                <div className="card-body pb-2 text-end">
                  <h5 className="fw-bold mb-0 fs-6 text-truncate">
                    {preview.title ||
                      (isArabic
                        ? `فيديو معاينة ${index + 1}`
                        : `Preview Video ${index + 1}`)}
                  </h5>
                </div>

                {/* الصورة وزر التشغيل */}
                <div
                  className="position-relative px-3"
                  onClick={() => setActiveVideo(preview)}
                  style={{ cursor: "pointer" }}
                >
                  <video
                    src={videoUrl}
                    alt={preview.title || "video preview"}
                    className="w-100 rounded-4"
                    style={{
                      height: "220px",
                      objectFit: "cover",
                    }}
                  />

                  {/* أيقونة زر تشغيل الفيديو */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "70px",
                      height: "70px",
                      background: "rgba(0,0,0,0.6)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaPlay className="text-white" size={24} />
                  </div>
                </div>

                {/* وصف الفيديو القصير */}
                <div
                  className="card-body pt-3 text-end"
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  <p className="text-muted small mb-0 text-truncate-2">
                    {preview.description ||
                      (isArabic
                        ? "فيديو توضيحي لمشاهدة جودة المحتوى والتعرف على الكورس."
                        : "A preview video to experience the content quality and learn about the course.")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* مودال موحد لتشغيل الفيديو - يتم إغلاق وتفريغ الفيديو من الذاكرة فور الإغلاق لتحسين الأداء */}
      <VideoPreviewModal
        show={!!activeVideo}
        onHide={handleClose}
        videoUrl={activeVideo?.video_url}
        videoTitle={activeVideo?.title}
        isArabic={isArabic}
        videoRef={videoRef}
        contentClassName="bg-dark border-0"
        className="ac-video-modal custom-preview-modal"
      />
    </div>
  );
};

export default CourseVideos;
