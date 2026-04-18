import { Container, Row, Col } from "react-bootstrap";
import { MOCK_DATA } from "../../data/mockData";
import { useTranslation } from "react-i18next";
import CourseCard from "../../components/shared/CourseCard/CourseCard";
import "./Courses.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Courses() {
  const navigate = useNavigate();
  const { t } = useTranslation("courses");
  const categories = MOCK_DATA.categories;
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [mode, setMode] = useState("all");
  // all | category | children
  const allCourses = MOCK_DATA.courses;
  const tags = MOCK_DATA.tags.slice(0, 3);

  //  FILTER LOGIC
  const filteredCourses =
    selectedCategoryId === null
      ? allCourses.slice(0, 6)
      : allCourses.filter((course) => {
          const cat = categories.find((c) => c.id === course.category_id);
          if (!cat) return false;

          // لو اختار parent
          if (cat.id === selectedCategoryId) return true;

          // لو اختار child
          return cat.parent_id === selectedCategoryId;
        });

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

        {/* FILTERS */}
        <div className="filter-container d-flex justify-content-center gap-2 mb-5">
          <button
            className={`filter-btn ${selectedCategoryId === null ? "active" : ""}`}
            onClick={() => setSelectedCategoryId(null)}
          >
            {t("all")}
          </button>

          {categories
            .filter((c) => c.parent_id === null)
            .map((cat) => (
              <button
                key={cat.id}
                className={`filter-btn ${
                  selectedCategoryId === cat.id ? "active" : ""
                }`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* COURSES */}
        <Row className="g-4">
          {filteredCourses.map((course) => (
            <Col lg={4} md={6} key={course.id}>
              <CourseCard course={course} tags={tags} />
            </Col>
          ))}
        </Row>
      </Container>
      <div className="text-center mt-4 ">
        <button
          className="filter-btn active px-4 py-2"
          onClick={() => navigate("/courses")}
        >
          Show More Courses
        </button>
      </div>
    </section>
  );
}

export default Courses;
