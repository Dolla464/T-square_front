import { useTranslation } from "react-i18next";
import placeholderVideo from "../../assets/video/1625-148614367.mp4";

const CourseVideos = () => {
  const { t, i18n } = useTranslation("coursesDetails");
  const isArabic = i18n?.language === "ar";
  return (
    <div className="mt-5" dir={isArabic ? "rtl" : "ltr"}>
      <h3 className="fw-bold mb-3">{t("course_preview")}</h3>

      <p className="text-muted mb-4 fs-5">{t("preview_description")}</p>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="ratio ratio-16x9">
            <video
              src={placeholderVideo}
              alt="course"
              className="w-100 rounded"
              controls
            />
          </div>
        </div>

        <div className="col-md-6">
          <div className="ratio ratio-16x9">
            <video
              src={placeholderVideo}
              alt="course"
              className="w-100 rounded"
              controls
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseVideos;
