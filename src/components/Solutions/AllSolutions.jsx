import React, { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AllSolutions.css";
import i18n from "../../i18n";
import { useSolutions } from "../../hooks/useSolutions";
import TestimonialsSection from "../shared/TestimonialsSection/TestimonialsSection";

function AllSolutions() {
  const navigate = useNavigate();
  const handleContact = useCallback(() => {
    navigate("/contact");
  }, [navigate]);
  const { t } = useTranslation(["solutions", "navbar", "testimonials"]);
  const isArabic = i18n.language === "ar";
  const { solutions, loading, error } = useSolutions();

  return (
    <div className="solutions-page">
      <Helmet>
        <title>{isArabic ? "الحلول والخدمات الرقمية - T-Square" : "Digital Solutions & Services - T-Square"}</title>
        <meta name="description" content={isArabic 
          ? "اكتشف الحلول البرمجية وتطوير المواقع والتطبيقات والخدمات الاستشارية الرقمية من T-Square."
          : "Discover web/app development solutions, technical systems, and digital consulting services from T-Square."
        } />
        <link rel="canonical" href={`${window.location.origin}/solutions`} />
        <meta property="og:title" content={isArabic ? "حلول برمجية وتطوير ويب متكامل" : "Comprehensive Digital & Software Solutions"} />
        <meta property="og:description" content={isArabic 
          ? "نساعد الشركات والمشاريع على النمو التقني وبناء منصات قوية."
          : "We help businesses grow technically by building robust software platforms."
        } />
        <meta property="og:url" content={`${window.location.origin}/solutions`} />
        <meta property="og:type" content="website" />
      </Helmet>
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
            {loading ? (
              <Col xs={12} className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </Col>
            ) : error ? (
              <Col xs={12} className="text-center py-5 text-danger">
                <p>Failed to load solutions data. please try again later.</p>
              </Col>
            ) : solutions.length === 0 ? (
              <Col xs={12} className="text-center py-5 text-muted">
                <p>No solutions found.</p>
              </Col>
            ) : (
              solutions.map((solution) => (
                <Col lg={4} md={6} key={solution.id}>
                  <div className="solution-card">
                    <h4 className="solution-title">{solution.title}</h4>
                    <p className="solution-desc text-muted">
                      {solution.description}
                    </p>
                    <div className="solution-tags d-flex flex-wrap gap-2 mb-4">
                      {solution.tags?.map((tag, idx) => (
                        <span key={idx} className="solution-tag">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    <button onClick={handleContact} className="btn-solution-contact w-100 mt-auto">
                      {t("contactUs")}
                    </button>
                  </div>
                </Col>
              ))
            )}
          </Row>
        </Container>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section text-center text-white py-5">
        <Container className="py-5 position-relative z-1">
          <h2 className="cta-title fw-bold mb-3">{t("ctaTitle")}</h2>
          <p className="cta-desc mb-4 mx-auto">{t("ctaDesc")}</p>
          <div className="mt-5">

            <Link to="/contact" className="btn-cta px-5 py-3 fw-bold rounded-3 text-decoration-none">{t("ctaBtn")}</Link>
          </div>
        </Container>
      </div>

      {/* سكشن التقييمات المشترك */}
      <TestimonialsSection />
    </div>
  );
}

export default AllSolutions;
