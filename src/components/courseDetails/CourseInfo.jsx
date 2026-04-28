import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

const CourseInfo = () => {
  const { t, i18n } = useTranslation("coursesDetails");
  const isArabic = i18n?.language === "ar";
  const { slug } = useParams();

  return (
    <div dir={isArabic ? "rtl" : "ltr"}>
      <nav className="mb-3 text-muted">
        <Link to="/" className="breadcrumb-item nav-link d-inline">
          {t("home")} <span className="mx-2">›</span>{" "}
          <span className="text-danger">{t("full_stack_course")}</span>
        </Link>
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
