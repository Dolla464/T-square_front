// صفحة تفاصيل الكورس
import React from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { DASHBOARD_MOCK } from "../../data/dashboardMockData";
import "./CourseDetails.css";

function CourseDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const { t } = useTranslation("studentDashboard");

  // استخدام البيانات من ملف الموك الرئيسي — مع فولباك من state لو متاح
  const course =
    DASHBOARD_MOCK.enrolledCourses.find((c) => String(c.id) === String(id)) ||
    state?.course ||
    DASHBOARD_MOCK.enrolledCourses[0];

  return (
    <div className="course-details-page" dir="ltr">
      <Helmet>
        <title>
          {t("course.details_title")} - {course.title} | T-Square
        </title>
      </Helmet>

      {/* البطاقة الحمراء العلوية — الهيرو */}
      <div className="course-details-hero">
        <div className="course-details-hero-row">
          {/* القسم الأيسر — معلومات الكورس */}
          <div className="course-details-hero-content">
            <h1>{course.title}</h1>
            <p className="course-details-hero-desc">{course.description}</p>

            {/* معلومات الميتا — دروس، ساعات، طلاب */}
            <div className="course-details-meta">
              <div className="course-details-meta-item">
                <i className="bi bi-book"></i>
                <span>
                  {course.lessonsCount} Lessons
                </span>
              </div>
              <div className="course-details-meta-item">
                <i className="bi bi-clock"></i>
                <span>
                  {course.duration} Hours
                </span>
              </div>
              <div className="course-details-meta-item">
                <i className="bi bi-people"></i>
                <span>
                  {course.studentsCount} Students
                </span>
              </div>
            </div>

            {/* زر متابعة التعلم */}
            <button className="course-details-continue-btn">
              <i className="bi bi-play-fill"></i>
              {t("course.continue_learning")}
            </button>
          </div>

          {/* القسم الأيمن — نسبة التقدم */}
          {/* <div className="course-details-progress-box">
            <div className="course-details-progress-pct">
              {course.progress}%
            </div>
            <p className="course-details-progress-label">
              {t("course.complete")}
            </p>

            {/* شريط التقدم */}
          {/* <div className="course-details-progress-bar-wrap">
              <div
                className="course-details-progress-bar-fill"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <span className="course-details-progress-info">
              {course.completedLessons} {t("course.of")} {course.lessonsCount}{" "}
              {t("course.lessons_lowercase")}
            </span>
          </div> */}
        </div>
      </div>

      {/* بطاقة المدرب */}
      <div className="course-details-instructor-card">
        <h4 className="course-details-instructor-title">
          About Instructor
        </h4>
        <div className="course-details-instructor-row">
          {/* أفاتار المدرب */}
          <div className="course-details-instructor-avatar">
            {course.instructorInitials}
          </div>
          {/* معلومات المدرب */}
          <div className="course-details-instructor-info">
            <h5>{course.instructor}</h5>
            <p className="course-details-instructor-role">
              {course?.instructorRole}
            </p>
            <p className="course-details-instructor-bio">
              {course?.instructorBio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
