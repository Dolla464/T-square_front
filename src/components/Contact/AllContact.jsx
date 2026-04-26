import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ContactForm from "../shared/ContactForm/ContactForm";
import TestimonialsSection from "../shared/TestimonialsSection/TestimonialsSection";
import "./AllContact.css";
import i18n from "../../i18n";
import CtaEnroll from "../shared/ctaEntroll/CtaEnroll";

function AllContact() {
  const { t } = useTranslation(["contact", "cta", "testimonials", "navbar"]);
  const isArabic = i18n.language === "ar";

  return (
    <div className="contact-page ">
      {/* Main Header & Form Section */}
      <div className="py-5 px-2 mt-5">
        <Container >
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
              {t("contact:titleBadge")}
            </span>
          </nav>

          {/* Header */}
          <div className="text-center mb-5 contact-header pt-3">
            <span className="badge-first-title">{t("contact:titleBadge")}</span>
            <h2 className="fw-bold mt-4 mb-3">{t("contact:title")}</h2>
            <p className="text-muted ">{t("contact:subtitle")}</p>
            <div className="d-md-none d-block">
              <h3 className="fw-bold mb-3">{t("contact:hearFromYou")}</h3>
              <p className="text-muted mb-5  ">
                {t("contact:hearFromYouDesc")}
              </p>
            </div>
          </div>

          {/* Contact Content Split Section */}
          <div className="contact-content-wrapper my-5">
            <Row className="g-5 align-items-center">
              {/* Left Col: Info Block */}
              <Col lg={5} className="pe-lg-4">
                <Col lg={12} className="d-md-block d-none">
                  <h3 className="fw-bold mb-3">{t("contact:hearFromYou")}</h3>
                  <p className="text-muted mb-5 ">
                    {t("contact:hearFromYouDesc")}
                  </p>
                </Col>

                <Row className="g-3 mb-5">
                  <Col sm={6} xs={12}>
                    <div className="info-card h-100">
                      <div className="info-icon">
                        <i className="bi bi-telephone text-danger"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{t("contact:phone")}</h6>
                        <small className="text-muted" dir="ltr">
                          +20 1234 33213
                        </small>
                      </div>
                    </div>
                  </Col>
                  <Col sm={6} xs={12}>
                    <div className="info-card h-100">
                      <div className="info-icon">
                        <i className="bi bi-envelope text-danger"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{t("contact:email")}</h6>
                        <small className="text-muted">TSquare@gmail.com</small>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="social-media-block d-flex align-items-center ps-md-0 ps-2 gap-4">
                  <span className="text-muted">{t("contact:social")}</span>
                  <div className="social-links d-flex gap-2">
                    <a href="#" className="social-icon" aria-label="Email">
                      <i className="bi bi-envelope-fill"></i>
                    </a>
                    <a href="#" className="social-icon" aria-label="Instagram">
                      <i className="bi bi-instagram"></i>
                    </a>
                    <a href="#" className="social-icon" aria-label="LinkedIn">
                      <i className="bi bi-linkedin"></i>
                    </a>
                    <a href="#" className="social-icon" aria-label="Facebook">
                      <i className="bi bi-facebook"></i>
                    </a>
                  </div>
                </div>
              </Col>

              {/* Right Col: Form Block */}
              <Col lg={7}>
                <div className="contact-form-card">
                  <ContactForm submitText={t("contact:form.send")} />
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      {/* General Call-To-Action Banner */}
      <CtaEnroll />

      {/* سكشن التقييمات المشترك */}
      <TestimonialsSection />
    </div>
  );
}

export default AllContact;
