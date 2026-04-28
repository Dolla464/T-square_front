import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPhone } from "react-icons/fa";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import i18n from "../../i18n";
import { t } from "i18next";

const CourseSidebar = ({ course }) => {
  const { t, i18n } = useTranslation("coursesDetails");

  const [show, setShow] = useState(false);
  const isArabic = i18n?.language === "ar";
  const navigate = useNavigate();

  if (!course || course == null) {
    return <Navigate to="/courses" replace />;
  }

  const handelPayment = (courseId) => {
    navigate(`/payment/${courseId}`);
  };

  return (
    <>
      <div className="d-none d-lg-block h-100" dir={isArabic ? "rtl" : "ltr"}>
        <div className="p-4 shadow  sidebar-card">
          {" "}
          <h3 className="fw-bold mb-2">
            {course.price.final} {isArabic ? "ج . م" : "EGP"}
          </h3>
          <p className="text-muted">{t("one_time_payment")}</p>
          <hr />
          <p className="d-flex justify-content-between">
            <span>{t("duration")}</span>
            <span className="fw-bold">
              {course.duration_weeks} {t("weeks")}
            </span>
          </p>
          <hr className="opacity-25" />
          <p className="d-flex justify-content-between">
            <span>{t("total_hours")}</span>
            <span className="fw-bold">
              {course.duration_hours} {t("hours")}
            </span>
          </p>
          <hr className="opacity-25" />
          <p className="d-flex justify-content-between">
            <span>{t("level")}</span>
            <span className="fw-bold">{course.level}</span>
          </p>
          <button
            className="btn btn-danger w-100 mt-3"
            disabled={!course}
            onClick={() => handelPayment(course.slug)}
          >
            {t("enroll_now")}
          </button>
          <Link to={"/contact"} className="btn btn-outline-danger w-100 mt-2">
            <FaPhone style={{ transform: "rotate(90deg)" }} size={20} />{" "}
            {t("contact_us")}
          </Link>
        </div>
      </div>

      {/* 🔵 Mobile Button */}
      <button
        className="btn btn-danger mobile-price-btn d-lg-none"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasRight"
        aria-controls="offcanvasRight"
        style={{
          position: "fixed",
          top: "25%",
          zIndex: 999,
          padding: "40px 10px",

          left: isArabic ? "auto" : "-5px",
          right: isArabic ? "-5px" : "auto",

          borderRadius: isArabic ? "50px 0px 0px 50px" : "0px 50px 50px 0px",
        }}
      ></button>

      {/* 🟣 Offcanvas */}
      <div
        className={`offcanvas ${
          isArabic ? "offcanvas-start" : "offcanvas-end"
        }`}
        tabIndex="-1"
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div
          dir={isArabic ? "rtl" : "ltr"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "80%",
            margin: "auto",
            marginTop: "15px",
          }}
        >
          <h3 style={{ fontWeight: "bold" }}>{t("Course_price")}</h3>

          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        {/* Body */}
        <div className="offcanvas-body">
          <div className="p-4 shadow  sidebar-card">
            {" "}
            <h3 className="fw-bold mb-2">
              {course.price.final} {isArabic ? "ج . م" : "EGP"}
            </h3>
            <p className="text-muted">{t("one_time_payment")}</p>
            <hr />
            <p className="d-flex justify-content-between">
              <span>{t("duration")}</span>
              <span className="fw-bold">
                {course.duration_weeks} {t("weeks")}
              </span>
            </p>
            <hr className="opacity-25" />
            <p className="d-flex justify-content-between">
              <span>{t("total_hours")}</span>
              <span className="fw-bold">
                {course.duration_hours} {t("hours")}
              </span>
            </p>
            <hr className="opacity-25" />
            <p className="d-flex justify-content-between">
              <span>{t("level")}</span>
              <span className="fw-bold">{course.level}</span>
            </p>
            <button
              className="btn btn-danger w-100 mt-3"
              disabled={!course}
              onClick={() => handelPayment(course.slug)}
            >
              {t("enroll_now")}
            </button>
            <Link to={"/contact"} className="btn btn-outline-danger w-100 mt-2">
              <FaPhone style={{ transform: "rotate(90deg)" }} size={20} />{" "}
              {t("contact_us")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseSidebar;
