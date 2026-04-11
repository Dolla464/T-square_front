import { Container, Row, Col } from "react-bootstrap";
import { MOCK_DATA } from "../../data/mockData";
import CourseCard from "../../components/shared/CourseCard/CourseCard";
import "./Courses.css";

function Courses() {
  const categories = MOCK_DATA.categories;
  // في الهوم هنعرض أول 6 كورسات فقط حسب طلبك
  const coursesData = MOCK_DATA.courses.slice(0, 6);
  const tags = MOCK_DATA.tags.slice(0, 3);

  return (
    <section className="courses-section py-5">
      <Container>
        <div className="text-center mb-4">
          <h2 className="fw-bold">Our Courses</h2>
          <p className="text-secondary">Explore our most popular programs.</p>
        </div>

        {/* الفلاتر (أقسام رئيسية فقط) */}
        <div className="filter-container d-flex justify-content-center gap-2 mb-5">
          <button className="filter-btn active">All</button>
          {categories.map((cat) => (
            <button key={cat.id} className="filter-btn">
              {cat.name}
            </button>
          ))}
        </div>

        <Row className="g-4">
          {coursesData.map((course) => (
            <Col lg={4} md={6} key={course.id}>
              <CourseCard course={course} tags={tags} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default Courses;
