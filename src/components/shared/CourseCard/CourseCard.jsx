import React, { useMemo } from "react";
import "./CourseCard.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { normalizeStorageUrl } from "../../../utils/resolveApiOrigin";

const VALID_ATTENDANCE_TYPES = ["online", "offline", "hybrid"];

const resolveAttendanceTypes = (course) => {
  if (Array.isArray(course?.attendance_types) && course.attendance_types.length > 0) {
    return course.attendance_types
      .map((type) => String(type).trim().toLowerCase())
      .filter((type) => VALID_ATTENDANCE_TYPES.includes(type));
  }

  if (course?.attendance_type) {
    const legacy = String(course.attendance_type).trim().toLowerCase();
    return VALID_ATTENDANCE_TYPES.includes(legacy) ? [legacy] : [];
  }

  return [];
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleDetails = (courseId) => {
    navigate(`/courses/course_details/${courseId}`);
  };
  const { t } = useTranslation("courses");

  const tags = Array.isArray(course?.tags) ? course.tags : [];
  const attendanceTypes = useMemo(() => resolveAttendanceTypes(course), [course]);

  return (
    <div className="course-card">
      <div className="course-img-wrapper">
        <img
          src={normalizeStorageUrl(course.image)}
          alt={course.title}
          className="course-img"
          width="400"
          height="200"
          loading="lazy"
        />
        {attendanceTypes.length > 0 && (
          <div className="course-badges">
            {attendanceTypes.map((type) => (
              <span
                key={type}
                className={`course-badge badge-${type}`}
              >
                {t(`card.${type}`)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="course-body">
        <h3 className="course-title" dir="ltr">
          {course.title}
        </h3>
        <div className="course-info">
          <span>
            <i className="bi bi-clock me-1"></i>
            {course.duration_weeks} {t("card.weeks")}
          </span>
          <span>
            <i className="bi bi-play-circle me-1"></i>
            {course.duration_hours} {t("card.hours")}
          </span>
        </div>
        <p className="course-desc" dir="ltr">
          {course.short_description}
        </p>

        <div className="course-tags" dir="ltr">
          {tags.map((tag) => (
            <span key={tag.id} className="tag">
              {tag.name}
            </span>
          ))}
        </div>

        <div className="course-footer">
          <div className="price-wrapper">
            <span className="course-price">
              {course.price?.final} {t("card.priceUnit")}
            </span>

            {course.price?.discount > 0 && (
              <small className="text-decoration-line-through ms-2 text-muted">
                {course.price?.original}
              </small>
            )}
          </div>
          <button
            onClick={() => handleDetails(course.slug)}
            className="buy-btn"
          >
            {t("card.details")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CourseCard);
