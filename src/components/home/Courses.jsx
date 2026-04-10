import { Container, Row, Col } from "react-bootstrap";
import "./Courses.css";
import { MOCK_DATA } from "../../data/mockData";
import courseThumb from "../../assets/course-temp.png";

function Courses() {
  // جلب البيانات من الموك داتا
  const categories = MOCK_DATA.categories;
  const coursesData = MOCK_DATA.courses;

  // دالة مساعدة للحصول على التاجات الخاصة بكل كورس من جدول التاجات
  // (بما إن الموك داتا حالياً مفهاش ربط مباشر، هنفترض عرض أول 3 تاجات كمثال)
  const tags = MOCK_DATA.tags.slice(0, 3);

  return (
    <section className="courses-section">
      <Container>
        <div className="text-center mb-4">
          <h2 className="fw-bold">Our Courses</h2>
          <p className="text-secondary">
            From beginner-friendly programs to advanced specializations — find
            your <br />
            perfect course.
          </p>
        </div>

        {/* Filters */}
        <div className="filter-container">
          {/* زرار "الكل" الافتراضي */}
          <button className="filter-btn active">All</button>
          {categories.map((cat) => (
            <button key={cat.id} className="filter-btn">
              {cat.name}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <Row className="g-4">
          {coursesData.map((course) => (
            <Col lg={4} md={6} key={course.id}>
              <div className="course-card">
                <div className="course-img-wrapper">
                  <img
                    src={courseThumb}
                    alt={course.title}
                    className="course-img"
                  />
                  {/* ربط نوع الحضور بالـ Badge */}
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

                  {/* وصف تجريبي بما إن الـ DB لسه مفيهاش Description طويل */}
                  <p className="course-desc">
                    Master {course.title} with hands-on projects and
                    professional mentorship.
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
                      {/* عرض سعر الخصم لو موجود */}
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
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default Courses;
