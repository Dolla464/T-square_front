import { useState, useEffect } from "react";
import { Container, Row, Col, Pagination, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // التعديل هنا
import CourseCard from "../../components/shared/CourseCard/CourseCard";
import { useCourses } from "../../hooks/useCourses";
import "./AllCourses.css";
import i18n from "../../i18n";

function AllCourses() {
  // تعريف الـ Hook بتاع الترجمة
  const { t } = useTranslation(["courses", "navbar", "testimonials"]);
  const isArabic = i18n.language === "ar";

  const {
    courses,
    categories,
    pagination,
    loading,
    loadInitialData,
    filterCourses,
  } = useCourses();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const coursesPerPage = 6;

  useEffect(() => {
    loadInitialData({
      per_page: coursesPerPage,
      type: "parent",
    });
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    filterCourses({
      per_page: coursesPerPage,
      category_id: categoryId,
      page: 1, // دي تضمن إننا بنرجع لأول صفحة لما نغير القسم
    });
  };

  const handlePageChange = (pageNumber) => {
    filterCourses({
      per_page: coursesPerPage,
      category_id: selectedCategoryId,
      page: pageNumber,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="all-courses-page py-5 mt-5">
      <Container>
        {/* Breadcrumbs */}
        <nav className="breadcrumb-nav mb-4 flex items-center rtl:flex-row-reverse">
          <Link to="/" className="breadcrumb-item">
            {t("navbar:home")}
          </Link>

          <span className="breadcrumb-separator mx-2">
            <span className="breadcrumb-separator mx-2">
              {isArabic ? (
                <i className="bi bi-chevron-left"></i>
              ) : (
                <i className="bi bi-chevron-right"></i>
              )}
            </span>
          </span>

          <span className="breadcrumb-item active">
            {t("navbar:solutions")}
          </span>
        </nav>

        {/* Header - مترجم */}
        <div className="text-center mb-5">
          <span className="badge-first-title">{t("titleBadge")}</span>
          <h2 className="fw-bold mt-4 mb-4">
            {t("title1")} <span className="text-danger">{t("title2")}</span>
          </h2>
          <p className="text-muted fs-5">{t("subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="filter-container d-flex justify-content-center gap-2 mb-5 flex-wrap">
          <button
            className={`filter-btn ${selectedCategoryId === null ? "active" : ""}`}
            onClick={() => handleCategoryChange(null)}
          >
            {t("all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${selectedCategoryId === cat.id ? "active" : ""}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.name} {/* اسم القسم غالباً بيجي من الداتابيز مترجم جاهز */}
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
              {courses.length > 0 ? (
                courses.map((course) => (
                  <Col lg={4} md={6} key={course.id}>
                    <CourseCard course={course} />
                  </Col>
                ))
              ) : (
                <div className="text-center py-5 w-100">
                  <h4 className="text-muted">{t("notFound")}</h4>
                </div>
              )}
            </Row>

            {/* Pagination */}
            {pagination?.lastPage > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="custom-pagination">
                  <Pagination.Prev
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  />
                  {[...Array(pagination.lastPage)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === pagination.currentPage}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={pagination.currentPage === pagination.lastPage}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}

export default AllCourses;
