import "./CourseCard.css";
import courseThumb from "../../../assets/course-temp.png";

const CourseCard = ({ course, tags }) => {
  return (
    <div className="course-card">
      <div className="course-img-wrapper">
        <img src={courseThumb} alt={course.title} className="course-img" />
        <span
          className={`course-badge badge-${course.attendance_type.toLowerCase()}`}
        >
          {course.attendance_type}
        </span>
      </div>

      <div className="course-body">
        <h3 className="course-title">{course.title}</h3>
        <div className="course-info">
          <span>
            <i className="bi bi-clock me-1"></i> 16 Weeks
          </span>
          <span>
            <i className="bi bi-play-circle me-1"></i> 120 h
          </span>
        </div>
        <p className="course-desc">
          Master {course.title} with hands-on projects and professional
          mentorship.
        </p>

        <div className="course-tags">
          {tags.map((tag) => (
            <span key={tag.id} className="tag">
              {tag.name}
            </span>
          ))}
        </div>

        <div className="course-footer">
          <div className="price-wrapper">
            <span className="course-price">
              {course.discount_price || course.price} EGP
            </span>
            {course.discount_price && (
              <small className="text-decoration-line-through ms-2 text-muted">
                {course.price}
              </small>
            )}
          </div>
          <button className="buy-btn">Buy now</button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
