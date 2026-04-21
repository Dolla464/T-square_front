import "./CourseCard.css";
import courseThumb from "../../../assets/course-temp.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleBuyNow = (courseId) => {
    navigate(`/payment/${courseId}`);
  };
  const { t } = useTranslation("courses");

  return (
    <div className="course-card">
      <div className="course-img-wrapper">
        {/* لما يكون عندنا صور الكورسات هنشيل courseThumb */}
        <img src={courseThumb || course.image} alt={course.title} className="course-img" />
        <span
          className={`course-badge badge-${course.attendance_type.toLowerCase()}`}
        >
          {course.attendance_type}
        </span>
      </div>

      <div className="course-body">
        <h3 className="course-title" dir="ltr">{course.title}</h3>
        <div className="course-info">
          <span>
            <i className="bi bi-clock me-1"></i>{course.duration_weeks} {t("card.weeks")}
          </span>
          <span>
            <i className="bi bi-play-circle me-1"></i>{course.duration_hours} {t("card.hours")}
          </span>
        </div>
        <p className="course-desc" dir="ltr">
          {course.short_description}

        </p>

        <div className="course-tags" dir="ltr">
          {course.tags?.map((tag) => (
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
          <button onClick={() => handleBuyNow(course.slug)} className="buy-btn">
            {t("card.buyNow")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
