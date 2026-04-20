import { Container, Row, Col } from "react-bootstrap";
import { useCategories } from "../../hooks/useCategories";
import { useTranslation } from "react-i18next";
import CourseCard from "../../components/shared/CourseCard/CourseCard";
import "./Courses.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../hooks/useCourses";
import i18n from "../../i18n";

function Courses() {
  const { courses, loading, error } = useCourses();
  const { categories } = useCategories();

  const navigate = useNavigate();
  const { t } = useTranslation("courses");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  // all | category | children
  const allCourses = courses;

  //  FILTER LOGIC
  const filteredCourses =
    selectedCategoryId === null
      ? allCourses.slice(0, 6)
      : allCourses.filter((course) => {
          const cat = categories.find((c) => c.name === course.category);

          if (!cat) return false;

          if (cat.id === selectedCategoryId) return true;

          return cat.parent_id === selectedCategoryId;
        });

  return (
    <section className="courses-section  py-md-5 my-3 py-5">
      <Container>
        <div className="text-center mb-5">
          <span className="badge-first-title">{t("titleBadge")}</span>
          <h2 className="fw-bold mt-4 mb-4">
            {t("title1")}
            <span className="text-danger">{t("title2")}</span>
          </h2>
          <p className="text-muted fs-5">{t("subtitle")}</p>
        </div>
        {courses && courses.length > 0 && (
          /* FILTERS */
          <div
            className="filter-container d-flex justify-content-center gap-2 mb-5"
            dir="ltr"
          >
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
        )}
        {/* COURSES */}
        {!courses || courses.length == 0 ? (
          <div className="text-center">
            <h3 className="text-dark text-danger">
              {i18n.language == "ar" ? "لا يوجد كوسات" : "No courses to view"}
            </h3>
            <h4 className="text-muted">
              {i18n.language == "ar"
                ? "حاول مجدداً بعد قليل"
                : "try again later"}
            </h4>
          </div>
        ) : (
          <Row className="g-4">
            {filteredCourses.map((course) => (
              <Col lg={4} md={6} key={course.id}>
                <CourseCard course={course} />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {courses && courses.length > 0 && (
        <div className="text-center mt-4 py-4">
          <button
            className="filter-btn active px-4 py-2"
            onClick={() => navigate("/courses")}
          >
            Show More Courses
          </button>
        </div>
      )}
    </section>
  );
}

export default Courses;
