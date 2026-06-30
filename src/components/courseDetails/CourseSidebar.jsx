import { useTranslation } from "react-i18next";
import { FaPhone } from "react-icons/fa";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axiosClient from "../../api/axios";
import { useState } from "react";
import { formatCoursePrice } from "../../utils/coursePrice";

const CourseSidebar = ({ course }) => {
  const { t, i18n } = useTranslation("coursesDetails");
  const { t: tCourses } = useTranslation("courses");
  const { user } = useAuth();
  const isArabic = i18n?.language === "ar";
  const navigate = useNavigate();
  const location = useLocation();

  const [isChecking, setIsChecking] = useState(false);

  if (!course || course == null) {
    return <Navigate to="/courses" replace />;
  }

  // 1. تعديل الدالة لتصبح المسؤولة بالكامل عن فحص التمكين وتوجيه المستخدم
  const handleEnrollmentProcess = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    let isEnrolled = false;

    try {
      setIsChecking(true);
      const response = await axiosClient.get(
        `/student/courses/${course.id}/check-enrollment?_t=${Date.now()}`,
      );
      if (response.data && response.data.status === "success") {
        isEnrolled = response.data.data.is_enrolled;
      }
    } catch (error) {
      console.error("Error during check:", error);
    } finally {
      setIsChecking(false);
    }

    // التوجيه لصفحة الدفع بعد انتهاء الفحص
    navigate(`/payment/${course.slug}`, {
      state: { isEnrolled: isEnrolled },
    });
  };

  return (
    <>
      <div className="d-none d-lg-block h-100" dir={isArabic ? "rtl" : "ltr"}>
        <div className="p-4 shadow sidebar-card">
          <h3 className="fw-bold mb-2">
            {formatCoursePrice(course, tCourses)}
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

          {/* 🟢 زر الشاشة الكبيرة المعدل */}
          <button
            className="btn btn-danger w-100 mt-3"
            disabled={!course || isChecking}
            onClick={handleEnrollmentProcess}
          >
            {isChecking ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              t("enroll_now")
            )}
          </button>

          <Link to={"/contact"} className="btn btn-outline-danger w-100 mt-2">
            <FaPhone style={{ transform: "rotate(90deg)" }} size={20} />{" "}
            {t("contact_us")}
          </Link>
        </div>
      </div>

      {/* 🔵 Mobile Floating Button Indicator */}
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
        className={`offcanvas ${isArabic ? "offcanvas-start" : "offcanvas-end"}`}
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
          <div className="p-4 shadow sidebar-card">
            <h3 className="fw-bold mb-2">
              {formatCoursePrice(course, tCourses)}
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

            {/* 🟢 زر الموبايل المعدل والمحمي بالـ Loader أيضاً */}
            <button
              className="btn btn-danger w-100 mt-3"
              disabled={!course || isChecking}
              onClick={handleEnrollmentProcess}
              data-bs-dismiss="offcanvas" // يغلق الـ offcanvas تلقائياً عند الانتقال لصفحة اللوج ان أو الدفع
            >
              {isChecking ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                t("enroll_now")
              )}
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
