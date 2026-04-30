import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import placeholderVideo from "../../assets/video/1625-148614367.mp4";

const CourseInfo = ({ course }) => {
  const { t, i18n } = useTranslation("coursesDetails");
  const isArabic = i18n?.language === "ar";

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

      <h1 className="fw-bold mb-2">{course.title}</h1>

      <p className="text-muted mb-4 fs-5">{course.short_description}</p>

      <div className="mb-4">
        {/* موقتا لحد لما يكون عندنا فيديوهات من الداتا بيز  */}
        {/* {course?.previews?.length ? (
          <video
            src={course.previews[0].url}
            className="w-100 rounded"
            controls
          />
        ) : (
          <video src={placeholderVideo} className="w-100 rounded" controls />
        )} */}
        <video src={placeholderVideo} className="w-100 rounded" controls />
      </div>

      <h4 className="fw-bold mb-2">{t("about_program")}</h4>

      <p className="text-muted mb-4 fs-5">{course.description}</p>
      {/* مرجعوش من الداتا بيز  */}
      {/* <h4 className="fw-bold mb-4">{t("what_you_will_learn")}</h4>

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

        <div className="col-md-6 mt-1">
          <h5 className="fw-semibold mb-3">{t("backend")}</h5>
          <ul className="text-muted">
            <li>{t("node")}</li>
            <li>{t("express")}</li>
            <li>{t("api")}</li>
            <li>{t("auth")}</li>
          </ul>
        </div>
      </div> */}
    </div>
  );
};

export default CourseInfo;
