import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AllTeam.css";
import studentImg from "../../assets/student-avatar.jpg";
import i18n from "../../i18n";
import { useInstructors } from "../../hooks/useInstructors";
import CtaEnroll from "../shared/ctaEntroll/CtaEnroll";
import TestimonialsSection from "../shared/TestimonialsSection/TestimonialsSection";

// مكون فرعي عشان نعرض الكارت بتاع كل عضو بشكل نضيف بدون ما نزحم الكود الرئيسي

function AllTeam() {
  const { t } = useTranslation(["team", "navbar", "cta", "testimonials"]);
  const isArabic = i18n.language === "ar";
  const { instructors, loading, error } = useInstructors();

  return (
    <div className="team-page">
      {/* الجزء الأساسي اللي فوق للمسار والعنوان الرئيسي */}
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

            <span className="breadcrumb-item active">{t("navbar:team")}</span>
          </nav>

          {/* هيدر الصفحة */}
          <div className="text-center mb-5 team-header">
            <span className="badge-first-title">{t("titleBadge")}</span>
            <h2 className="fw-bold mt-4 mb-3">
              {t("title1")}
              <span className="text-danger">{t("title2")}</span>
            </h2>
            <p className="text-muted fs-5">{t("subtitle")}</p>
          </div>

          {/* جريد عرض أعضاء الفريق */}
          <Row className="g-4 mb-5 pb-4">
            {loading ? (
              <Col xs={12} className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </Col>
            ) : error ? (
              <Col xs={12} className="text-center py-5 text-danger">
                <p>Failed to load team data. please try again later.</p>
              </Col>
            ) : instructors.length === 0 ? (
              <Col xs={12} className="text-center py-5 text-muted">
                <p>No team members found.</p>
              </Col>
            ) : (
              instructors.map((member, index) => (
                <Col lg={3} md={6} sm={6} key={index}>
                  <div className="team-card">
                    <div className="member-img-wrapper">
                      <img
                        //نغير الصوره لما تكون متوفره فالداتا بيز 
                        src={studentImg || member.image}
                        alt={member.fullname || "Instructor"}
                        className="member-img"
                      />
                    </div>
                    <div className="member-info text-center">
                      <h5 className="member-name fw-bold mb-1">{member.fullname}</h5>
                      <p className="member-role text-muted mb-3">{member.field || "Instructor"}</p>

                      {/* ايقونات السوشيال ميديا الخاصة بعضو الفريق */}
                      <div className="social-links d-flex justify-content-center gap-2">
                        <a href={member.email ? `mailto:${member.email}` : "#"} className="social-icon">
                          <i className="bi bi-envelope-fill"></i>
                        </a>
                        <a href={member.insta_url || "#"} className="social-icon">
                          <i className="bi bi-instagram"></i>
                        </a>
                        <a href={member.linkedin_url || "#"} className="social-icon">
                          <i className="bi bi-linkedin"></i>
                        </a>
                        <a href={member.facebook_url || "#"} className="social-icon">
                          <i className="bi bi-facebook"></i>
                        </a>
                      </div>
                    </div>
                  </div>{" "}
                </Col>
              )))}
          </Row>
        </Container>
      </div>

      {/* الجزء الخاص بالـ Call To Action (دعوة للتسجيل) */}
      <CtaEnroll />

      {/* سكشن التقييمات المشترك */}
      <TestimonialsSection />
    </div>
  );
}

export default AllTeam;
