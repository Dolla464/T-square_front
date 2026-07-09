import { Container, Row, Col, Spinner, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import CourseCard from "../../components/shared/CourseCard/CourseCard";
import "./Courses.css";
import { useState, useEffect } from "react";
import { useCourses } from "../../hooks/useCourses";

function Courses({ initialData = null }) {
  const { t } = useTranslation("courses");
  const { courses, categories, loading, loadInitialData, filterCourses, setInitialData } =
    useCourses();
  const [activeCategory, setActiveCategory] = useState(null);
  const categoryList = Array.isArray(categories) ? categories : [];

  const hasBundledData =
    initialData &&
    ((Array.isArray(initialData.items) && initialData.items.length > 0) ||
      (Array.isArray(initialData.categories) && initialData.categories.length > 0));

  useEffect(() => {
    if (hasBundledData) {
      setInitialData({
        courses: initialData.items ?? [],
        categories: initialData.categories ?? [],
        pagination: {
          currentPage: initialData.meta?.current_page ?? 1,
          lastPage: initialData.meta?.last_page ?? 1,
          total: initialData.meta?.total ?? 0,
        },
      });
      return;
    }

    loadInitialData({
      per_page: 6,
      type: "sub",
    });
  }, [hasBundledData, initialData, loadInitialData, setInitialData]);

  const handleFilter = (categoryId) => {
    setActiveCategory(categoryId);
    filterCourses({
      per_page: 6,
      category_id: categoryId,
    });
  };

  return (
    <section className="courses-section py-md-5 py-5">
      <Container>
        <div className="text-center mb-5">
          <span className="badge-first-title">{t("titleBadge")}</span>
          <h2 className="fw-bold mt-4 mb-4">
            {t("title1")} <span className="text-danger">{t("title2")}</span>
          </h2>
          <p className="text-muted fs-5">{t("subtitle")}</p>
        </div>

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

          {categoryList.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => handleFilter(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

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
