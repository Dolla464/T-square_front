import { useState } from "react";
import { Container, Row, Col, Pagination } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MOCK_DATA } from "../../data/mockData";
import CourseCard from "../../components/shared/CourseCard/CourseCard";
import "./AllCourses.css";
import i18n from "../../i18n";

function AllCourses() {
  const { t } = useTranslation(["courses", "navbar"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const isArabic = i18n.language === "ar";
  // 1. تصفية الأقسام الرئيسية فقط (اللي الـ parent_id بتاعها null)
  // دي اللي هتظهر في الأزرار فوق
  const mainCategories = MOCK_DATA.categories.filter(
    (cat) => cat.parent_id === null,
  );

  // 2. منطق الفلترة الذكي (بناءً على الـ parent_id والـ category_id)
  const filteredCourses =
    selectedCategory === "All"
      ? MOCK_DATA.courses
      : MOCK_DATA.courses.filter((course) => {
          // البحث عن القسم المربوط به الكورس حالياً
          const currentCat = MOCK_DATA.categories.find(
            (cat) => cat.id === course.category_id,
          );
          if (!currentCat) return false;

          // حالة 1: الكورس مربوط مباشرة بالقسم المختار (مثلاً مربوط بـ Kids Courses)
          if (currentCat.name === selectedCategory) return true;

          // حالة 2: الكورس مربوط بقسم فرعي (مثلاً Web) والأب بتاعه هو المختار (Adult)
          const parentCat = MOCK_DATA.categories.find(
            (cat) => cat.id === currentCat.parent_id,
          );
          return parentCat?.name === selectedCategory;
        });

  // 3. Pagination Logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse,
  );
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

          <span className="breadcrumb-item active">{t("navbar:courses")}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-5">
          <span className="badge-first-title">{t("titleBadge")}</span>
          <h2 className="fw-bold mt-4 mb-4">
            {t("title1")}
            <span className="text-danger">{t("title2")}</span>
          </h2>
          <p className="text-muted fs-5">{t("subtitle")}</p>
        </div>

        {/* الأزرار: بتعرض بس الأقسام اللي الـ parent_id بتاعها null */}
        <div className="filter-container d-flex justify-content-center gap-2 mb-5">
          <button
            className={`filter-btn ${selectedCategory === "All" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("All");
              setCurrentPage(1);
            }}
          >
            {t("all")}
          </button>
          {mainCategories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${selectedCategory === cat.name ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory(cat.name);
                setCurrentPage(1);
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <Row className="g-4">
          {currentCourses.length > 0 ? (
            currentCourses.map((course) => (
              <Col lg={4} md={6} key={course.id}>
                <CourseCard course={course} tags={MOCK_DATA.tags.slice(0, 2)} />
              </Col>
            ))
          ) : (
            <div className="text-center py-5 w-100">
              <h4 className="text-muted">{t("notFound")}</h4>
            </div>
          )}
        </Row>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-5">
            <Pagination className="custom-pagination">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </Pagination>
          </div>
        )}
      </Container>
    </div>
  );
}

export default AllCourses;
