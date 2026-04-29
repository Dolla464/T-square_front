import { useTranslation } from "react-i18next";

import { FaPhone, FaTags } from "react-icons/fa";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import i18n from "../../i18n";
import { t } from "i18next";

const CourseSidebar = ({ course }) => {
  const { t, i18n } = useTranslation("coursesDetails");

  const [show, setShow] = useState(false);
  const isArabic = i18n?.language === "ar";

  const SidebarContent = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="fw-bold m-0">{t("price")}</h3>
      </div>
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

      <button className="btn btn-danger w-100 mt-3">{t("enroll_now")}</button>
      <button className="btn btn-outline-danger w-100 mt-2">
        <FaPhone style={{ transform: "rotate(90deg)" }} size={20} />{" "}
        {t("contact_us")}
      </button>
    </>
  );

  return (
    <>
      {/* 💻 Desktop View */}
      <div className="d-none d-lg-block h-100" dir={isArabic ? "rtl" : "ltr"}>
        <div className="p-4 shadow rounded sidebar-card">
          <SidebarContent />
        </div>
      </div>

      {/* 🔵 Mobile Button Trigger */}
      <button
        className="btn btn-danger mobile-price-btn d-lg-none d-flex justify-content-center align-items-center"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasRight"
        aria-controls="offcanvasRight"
        title={t("enroll_now")}
        style={{
          position: "fixed",
          top: "25%",
          zIndex: 999,
          padding: "15px 20px",
          // لو عربي خليه على الشمال، لو إنجليزي خليه على اليمين
          left: isArabic ? "-5px" : "auto",
          right: isArabic ? "auto" : "-5px",
          // عكس تدوير الحواف بناءً على هو في أنهي اتجاه
          borderRadius: isArabic ? "0px 50px 50px 0px" : "50px 0px 0px 50px",
        }}
      >
        <FaTags size={24} />
      </button>

      {/* 🟣 Offcanvas for Mobile */}
      <div
        // كلاس offcanvas-end هيظهر يمين في الإنجليزي وشمال في العربي
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px 20px",
            borderBottom: "1px solid #eee",
          }}
        >
          <h3 style={{ fontWeight: "bold", margin: 0 }}>{t("Course_price")}</h3>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        {/* Body */}
        <div className="offcanvas-body">
          <div className="mobile-sidebar p-2">
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseSidebar;
