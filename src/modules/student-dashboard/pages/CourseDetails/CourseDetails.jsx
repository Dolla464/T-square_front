// صفحة تفاصيل الكورس
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import "./CourseDetails.css";
import { useCourseSlug } from "../../hooks/useCousrsesSlug";

function CourseDetails() {
  const { slug } = useParams();
  const { t } = useTranslation("studentDashboard");

  // استخدام البيانات من ملف الموك الرئيسي — مع فولباك من state لو متاح
  const { courseData } = useCourseSlug(slug);
  console.log(slug);

  const handeDrive = () =>
    courseData.google_drive_link != null && courseData.google_drive_link != ""
      ? window.open(courseData.google_drive_link || "")
      : null;
  return (
    <div className="course-details-page" dir="ltr">
      <Helmet>
        <title>
          {courseData
            ? `${t("course.details_title")} - ${courseData.title} | T-Square`
            : `${t("course.details_title")} | T-Square`}
        </title>
      </Helmet>

      {/* البطاقة الحمراء العلوية — الهيرو */}
      <div className="course-details-hero">
        <div className="course-details-hero-row">
          {/* القسم الأيسر — معلومات الكورس */}
          <div className="course-details-hero-content">
            <h1>{courseData?.title}</h1>
            <p className="course-details-hero-desc">{courseData?.description}</p>

            {/* معلومات الميتا — دروس، ساعات، طلاب */}
            <div className="course-details-meta">
              <div className="course-details-meta-item">
                <i className="bi bi-clock"></i>
                <span>{courseData?.duration_hours} Hours</span>
              </div>
              <div className="course-details-meta-item">
                <i className="bi bi-calendar"></i>
                <span>{courseData?.duration_weeks} Weeks</span>
              </div>
            </div>

            {/* زر متابعة التعلم */}
            <button
              onClick={handeDrive}
              className="course-details-continue-btn"
            >
              <i className="bi bi-play-fill"></i>
              {t("course.continue_learning")}
            </button>
          </div>

          {/* القسم الأيمن — نسبة التقدم */}
          {/* <div className="course-details-progress-box">
            <div className="course-details-progress-pct">
              {courseData.progress}%
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
        <h4 className="course-details-instructor-title">About Instructor</h4>
        <div className="course-details-instructor-row">
          {/* أفاتار المدرب */}
          <div className="course-details-instructor-avatar">
            {courseData?.instructorInitials}
          </div>
          {/* معلومات المدرب */}
          <div className="course-details-instructor-info">
            <h5>{courseData?.instructor.full_name}</h5>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
