import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPhone } from "react-icons/fa";

const CourseSidebar = () => {
  const [show, setShow] = useState(false);
  const { t, i18n } = useTranslation("coursesDetails");
  const isArabic = i18n?.language === "ar";
  return (
    <>
      <div className="d-none d-lg-block h-100" dir={isArabic ? "rtl" : "ltr"}>
        <div className="p-4 shadow rounded sidebar-card">
          {" "}
          <h3 className="fw-bold mb-2">{t("price")}</h3>
          <p className="text-muted">{t("one_time_payment")}</p>
          <hr />
          <p className="d-flex justify-content-between">
            <span>{t("duration")}</span>
            <span className="fw-bold">{t("duration_value")}</span>
          </p>
          <hr className="opacity-25" />
          <p className="d-flex justify-content-between">
            <span>{t("total_hours")}</span>
            <span className="fw-bold">{t("total_hours_value")}</span>
          </p>
          <hr className="opacity-25" />
          <p className="d-flex justify-content-between">
            <span>{t("study_type")}</span>
            <span className="fw-bold">{t("study_type_value")}</span>
          </p>
          <hr className="opacity-25" />
          <p className="d-flex justify-content-between">
            <span>{t("level")}</span>
            <span className="fw-bold">{t("level_value")}</span>
          </p>
          <button className="btn btn-danger w-100 mt-3">
            {t("enroll_now")}
          </button>
          <button className="btn btn-outline-danger w-100 mt-2">
            <FaPhone style={{ transform: "rotate(90deg)" }} size={20} />{" "}
            {t("contact_us")}
          </button>
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
          <div className="mobile-sidebar p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fw-bold m-0">{t("price")}</h3>
            </div>

            <p className="text-muted">{t("one_time_payment")}</p>
            <hr />

            <p className="d-flex justify-content-between">
              <span>{t("duration")}</span>
              <span className="fw-bold">{t("duration_value")}</span>
            </p>

            <p className="d-flex justify-content-between">
              <span>{t("total_hours")}</span>
              <span className="fw-bold">{t("total_hours_value")}</span>
            </p>

            <p className="d-flex justify-content-between">
              <span>{t("study_type")}</span>
              <span className="fw-bold">{t("study_type_value")}</span>
            </p>

            <p className="d-flex justify-content-between">
              <span>{t("level")}</span>
              <span className="fw-bold">{t("level_value")}</span>
            </p>

            <button className="btn btn-danger w-100 mt-3">
              {t("enroll_now")}
            </button>

            <button className="btn btn-outline-danger w-100 mt-2">
              <FaPhone style={{ transform: "rotate(90deg)" }} size={20} />{" "}
              {t("contact_us")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseSidebar;
