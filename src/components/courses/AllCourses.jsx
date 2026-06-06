import { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
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
  } = useCourses("parent");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const isMounted = useRef(false);
  const coursesPerPage = 6;

  // Debounce logic for searching
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      filterCourses({
        per_page: coursesPerPage,
        category_id: selectedCategoryId,
        search: searchTerm,
        page: 1,
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, selectedCategoryId, coursesPerPage]);

  useEffect(() => {
    loadInitialData({
      per_page: coursesPerPage,
      type: "parent",
    });
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategoryId(categoryId);
    filterCourses({
      per_page: coursesPerPage,
      category_id: categoryId,
      search: searchTerm,
      page: 1, // دي تضمن إننا بنرجع لأول صفحة لما نغير القسم
    });
  }, [filterCourses, coursesPerPage, searchTerm]);

  const handlePageChange = useCallback((pageNumber) => {
    filterCourses({
      per_page: coursesPerPage,
      category_id: selectedCategoryId,
      search: searchTerm,
      page: pageNumber,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filterCourses, coursesPerPage, selectedCategoryId, searchTerm]);

  return (
    <div className="all-courses-page py-5 mt-5">
      <Helmet>
        <title>{isArabic ? "الكورسات والمسارات البرمجية - T-Square" : "Programming Courses & Tracks - T-Square"}</title>
        <meta name="description" content={isArabic
          ? "تصفح الكورسات والمخططات التدريبية المتميزة في البرمجة وتطوير الويب والشبكات على منصة T-Square."
          : "Browse professional programming, web development, and networking courses on the T-Square platform."
        } />
        <link rel="canonical" href={`${window.location.origin}/courses`} />
        <meta property="og:title" content={isArabic ? "كورسات برمجة وتدريب تقني مميز" : "Professional Programming & Tech Courses"} />
        <meta property="og:description" content={isArabic
          ? "تطوير مهاراتك مع كورسات T-Square العملية."
          : "Upgrade your technical skills with practical T-Square courses."
        } />
        <meta property="og:url" content={`${window.location.origin}/courses`} />
        <meta property="og:type" content="website" />
      </Helmet>
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
            {t("navbar:courses")}
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

        {/* Search Bar */}
        <div className="courses-search-container">
          <i className="bi bi-search courses-search-icon"></i>
          <input
            type="text"
            className="form-control courses-search-input w-100"
            placeholder={isArabic ? "ابحث عن كورس..." : "Search for a course..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
