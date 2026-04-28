import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

const CourseInfo = () => {
  const { t, i18n } = useTranslation("coursesDetails");
  const isArabic = i18n?.language === "ar";
  const { slug } = useParams();

  return (
    <div dir={isArabic ? "rtl" : "ltr"}>
      {/* Breadcrumbs */}
      <nav className="breadcrumb-nav mb-4 d-flex align-items-center">
        <Link to="/" className="breadcrumb-item">
          {t("navbar:home")}
        </Link>
        <span className="breadcrumb-separator mx-2">
          {isArabic ? (
            <i className="bi bi-chevron-left"></i>
          ) : (
            <i className="bi bi-chevron-right"></i>
          )}
        </span>
        <Link to="/courses" className="breadcrumb-item">
          {t("courses_page")}
        </Link>
        <span className="breadcrumb-separator mx-2">
          {isArabic ? (
            <i className="bi bi-chevron-left"></i>
          ) : (
            <i className="bi bi-chevron-right"></i>
          )}
        </span>
        <span className="breadcrumb-item active">{t("course_details")}</span>
      </nav>

      <h1 className="fw-bold mb-2">{t("course_title")}</h1>

      <p className="text-muted mb-4 fs-5">{t("course_description")}</p>

      <div className="mb-4">
        <video
          src="public/videos/WhatsApp Video 2026-04-22 at 8.10.16 PM.mp4"
          alt="course"
          className="w-100 rounded"
          controls
        />
      </div>

      <h4 className="fw-bold mb-2">{t("about_program")}</h4>

      <p className="text-muted fs-5">{t("about_description")}</p>
      <p className="text-muted mb-3 fs-5">{t("about_paragraph_2")}</p>
      <p className="text-muted mb-4 fs-5">{t("about_paragraph_3")}</p>

      <h4 className="fw-bold mb-4">{t("what_you_will_learn")}</h4>

      <div className="row">
        <div className="col-md-6">
          <h5 className="fw-semibold mb-3">{t("frontend")}</h5>
          <ul className="text-muted">
            <li>{t("html")}</li>
            <li>{t("css")}</li>
            <li>{t("responsive")}</li>
            <li>{t("javascript")}</li>
            <li>{t("react")}</li>
            <li>{t("git")}</li>
          </ul>
        </div>

        <div className="col-md-6">
          <h5 className="fw-semibold mb-3">{t("backend")}</h5>
          <ul className="text-muted">
            <li>{t("node")}</li>
            <li>{t("express")}</li>
            <li>{t("api")}</li>
            <li>{t("auth")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourseInfo;
