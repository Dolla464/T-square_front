import { Container, Row, Col, Spinner, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom"; // مهم جداً للزرار الجديد
import CourseCard from "../../components/shared/CourseCard/CourseCard";
import "./Courses.css";
import { useState, useEffect } from "react";
import { useCourses } from "../../hooks/useCourses";

function Courses() {
  const { t } = useTranslation("courses");
  const { courses, categories, loading, loadInitialData, filterCourses } =
    useCourses();
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    loadInitialData({
      per_page: 6,
      type: "sub",
    });
  }, []);

  const handleFilter = (categoryId) => {
    setActiveCategory(categoryId);
    filterCourses({
      per_page: 6,
      category_id: categoryId,
    });
  };

  return (
    <section className="courses-section py-md-5 my-3 py-5">
      <Container>
        {/* Header */}
        <div className="text-center mb-5">
          <span className="badge-first-title">{t("titleBadge")}</span>
          <h2 className="fw-bold mt-4 mb-4">
            {t("title1")} <span className="text-danger">{t("title2")}</span>
          </h2>
          <p className="text-muted fs-5">{t("subtitle")}</p>
        </div>

        {/* Filters */}
        <div
          className="filter-container d-flex justify-content-center gap-2 mb-5 flex-wrap"
          dir="ltr"
        >
          <button
            className={`filter-btn ${!activeCategory ? "active" : ""}`}
            onClick={() => handleFilter(null)}
          >
            {t("all")}
          </button>

          {categories?.slice(0, 7).map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => handleFilter(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
          </div>
        ) : (
          <>
            <Row className="g-4">
              {courses?.length > 0 ? (
                courses.map((course) => (
                  <Col lg={4} md={6} key={course.id}>
                    <CourseCard course={course} />
                  </Col>
                ))
              ) : (
                <Col className="text-center py-5">
                  <p className="text-muted fs-5">
                    {t("notFound") || "No courses found."}
                  </p>
                </Col>
              )}
            </Row>

            {/* Explore More Button - يظهر فقط بعد التحميل وعند وجود كورسات */}
            {courses?.length > 0 && (
              <div className="text-center mt-5">
                <Link to="/courses">
                  <Button
                    variant="outline-danger"
                    className="px-5 py-3 fw-bold rounded-pill shadow-sm explore-btn"
                  >
                    {t("explore")}
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}

export default Courses;
