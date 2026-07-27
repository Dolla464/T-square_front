import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const CourseInfo = ({ course }) => {
  const { t, i18n } = useTranslation("coursesDetails");
  const isArabic = i18n?.language === "ar";

  return (
    <div className="text-center text-lg-end" dir={isArabic ? "rtl" : "ltr"}>
      {/* Breadcrumbs - استخدمنا justify-content-lg-start لضمان المحاذاة */}
      <nav className="breadcrumb-nav mb-4 d-flex align-items-center justify-content-center justify-content-lg-start">
        <Link to="/" className="breadcrumb-item text-decoration-none">
          {t("navbar:home")}
        </Link>
        <span className="breadcrumb-separator mx-2">
          <i className={`bi bi-chevron-${isArabic ? "left" : "right"}`}></i>
        </span>
        <Link to="/courses" className="breadcrumb-item text-decoration-none">
          {t("courses_page")}
        </Link>
        <span className="breadcrumb-separator mx-2">
          <i className={`bi bi-chevron-${isArabic ? "left" : "right"}`}></i>
        </span>
        <span className="breadcrumb-item active">{t("course_details")}</span>
      </nav>

      {/* العناوين والوصف */}
      <div className="text-end">
        <h1 className="fw-bold mb-2">{course.title}</h1>
        <p className="text-muted mb-4 fs-5">{course.short_description}</p>
      </div>

      <div className="mb-4">
        <img
          src={course.cover_image}
          alt={course.title}
          className="img-fluid rounded"
        />
      </div>

      <div className="text-end">
        <h4 className="fw-bold mb-2">{t("about_program")}</h4>
        <p className="text-muted mb-4 fs-5">{course.description}</p>
      </div>

      {course.learnings?.length > 0 && (
        <section className="course-learnings-section text-end mb-4">
          <h4 className="fw-bold mb-3">{t("what_you_will_learn")}</h4>
          <div className="row g-3">
            {course.learnings.map((item, index) => (
              <div className="col-12 col-md-6" key={index}>
                <div className="course-learning-item">
                  <i className="bi bi-check-circle-fill course-learning-check"></i>
                  <span className="text-muted fs-5">{item}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CourseInfo;
