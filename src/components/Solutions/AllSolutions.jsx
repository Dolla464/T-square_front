import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AllSolutions.css";
import { MOCK_DATA } from "../../data/mockData";
import studentImg from "../../assets/student-avatar.jpg";
import i18n from "../../i18n";

function AllSolutions() {
  const navigate = useNavigate();
  const handleContact = () => {
    navigate("/contact");
  };
  const { t } = useTranslation(["solutions", "navbar", "testimonials"]);
  const { solutionsData, testimonialsData } = MOCK_DATA;
  const isArabic = i18n.language === "ar";

  return (
    <div className="solutions-page">
      {/* Top spacing similar to AllCourses */}
      <div className="py-5 mt-5">
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

          {/* Header Section */}
          <div className="text-center mb-5 solutions-header">
            <span className="badge-first-title">{t("titleBadge")}</span>
            <h2 className="fw-bold mt-4 mb-3">
              {t("title1")}
              <span className="text-danger">{t("title2")}</span>
            </h2>
            <p className="text-muted fs-5">{t("subtitle")}</p>
          </div>

          {/* Solutions Grid */}
          <Row className="g-4 mb-5 pb-4">
            {solutionsData.map((solution) => (
              <Col lg={4} md={6} key={solution.id}>
                <div className="solution-card">
                  <h4 className="solution-title">{solution.title}</h4>
                  <p className="solution-desc text-muted">
                    {solution.description}
                  </p>
                  <div className="solution-tags d-flex flex-wrap gap-2 mb-4">
                    {solution.tags.map((tag, idx) => (
                      <span key={idx} className="solution-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button onClick={handleContact} className="btn-solution-contact w-100 mt-auto">
                    {t("contactUs")}
                  </button>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section text-center text-white py-5">
        <Container className="py-5 position-relative z-1">
          <h2 className="cta-title fw-bold mb-3">{t("ctaTitle")}</h2>
          <p className="cta-desc mb-4 mx-auto">{t("ctaDesc")}</p>
          <button className="btn-cta">{t("ctaBtn")}</button>
        </Container>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section py-5">
        <Container className="py-5">
          <h2 className="text-center fw-bold mb-5">
            {t("testimonials:title")}
          </h2>
          <Row className="g-4">
            {testimonialsData.map((testimonial) => (
              <Col lg={4} md={6} key={testimonial.id}>
                <div className="testimonial-card">
                  <div className="quote-icon mb-3">
                    <span className="quote-mark">“</span>
                  </div>
                  <div className="d-flex align-items-center mb-4">
                    <img
                      src={studentImg}
                      alt={testimonial.name}
                      className="testimonial-avatar"
                      style={{ marginInlineEnd: "12px" }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">{testimonial.name}</h6>
                      <small className="text-muted">{testimonial.role}</small>
                      <div className="mt-1 d-flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`bi bi-star-fill ${i < testimonial.stars ? "text-warning" : "text-light-gray"}`}
                            style={{ fontSize: "14px" }}
                          ></i>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted testimonial-text">
                    "{testimonial.text}"
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default AllSolutions;
