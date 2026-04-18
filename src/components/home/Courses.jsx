import { Container, Row, Col } from "react-bootstrap";
import { MOCK_DATA } from "../../data/mockData";
import { useTranslation } from "react-i18next";
import CourseCard from "../../components/shared/CourseCard/CourseCard";
import "./Courses.css";

function Courses() {
  const { t } = useTranslation("courses");
  const categories = MOCK_DATA.categories;
  // في الهوم هنعرض أول 6 كورسات فقط حسب طلبك
  const coursesData = MOCK_DATA.courses.slice(0, 6);
  const tags = MOCK_DATA.tags.slice(0, 3);

  return (
    <section className="courses-section py-5">
      <Container>
        <div className="text-center mb-5">
          <span className="badge-first-title">{t("titleBadge")}</span>
          <h2 className="fw-bold mt-4 mb-4">
            {t("title1")}
            <span className="text-danger">{t("title2")}</span>
          </h2>
          <p className="text-muted fs-5">{t("subtitle")}</p>
        </div>

        {/* الفلاتر (أقسام رئيسية فقط) */}
        <div className="filter-container d-flex justify-content-center gap-2 mb-5">
          <button className="filter-btn active">{t("all")}</button>
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
