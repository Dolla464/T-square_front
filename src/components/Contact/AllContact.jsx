import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MOCK_DATA } from "../../data/mockData";
import studentImg from "../../assets/student-avatar.jpg";
import "./AllContact.css";
import i18n from "../../i18n";

function AllContact() {
  const { t } = useTranslation(["contact", "cta", "testimonials", "navbar"]);
  const { teamTestimonialsData } = MOCK_DATA;
  const isArabic = i18n.language === "ar";

  // Contact Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    track: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // Add form API logical integration here
  };

  return (
    <div className="contact-page">
      {/* Main Header & Form Section */}
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
              {t("contact:titleBadge")}
            </span>
          </nav>

          {/* Header */}
          <div className="text-center mb-5 contact-header pt-3">
            <span className="badge-first-title">{t("contact:titleBadge")}</span>
            <h2 className="fw-bold mt-4 mb-3">{t("contact:title")}</h2>
            <p className="text-muted fs-5">{t("contact:subtitle")}</p>
            <div className="d-md-none d-block">
              <h3 className="fw-bold mb-3">{t("contact:hearFromYou")}</h3>
              <p className="text-muted mb-5  fw-bold">
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
                  <p className="text-muted mb-5 desc-padding">
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
                        <small className="text-muted">+20 1234 33213</small>
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

                <div className="social-media-block d-flex align-items-center gap-4">
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
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4" controlId="contactName">
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder={t("contact:form.name")}
                        className="custom-input shadow-none"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="contactEmail">
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder={t("contact:form.emailAddress")}
                        className="custom-input shadow-none"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="contactPhone">
                      <Form.Control
                        type="tel"
                        name="phone"
                        placeholder={t("contact:form.phoneNumber")}
                        className="custom-input shadow-none"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="contactTrack">
                      <Form.Control
                        type="text"
                        name="track"
                        placeholder={t("contact:form.track")}
                        className="custom-input shadow-none"
                        value={formData.track}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="contactMessage">
                      <Form.Control
                        as="textarea"
                        name="message"
                        rows={4}
                        placeholder={t("contact:form.message")}
                        className="custom-textarea custom-input shadow-none"
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <button
                      type="submit"
                      className="btn-contact-submit w-100 mt-2"
                    >
                      {t("contact:form.send")}
                    </button>
                  </Form>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      {/* General Call-To-Action Banner */}
      <div className="cta-journey-section text-center text-white py-5 mt-5">
        <Container className="py-5 position-relative z-1">
          <h2 className="cta-title fw-bold mb-3">{t("cta:title")}</h2>
          <p className="cta-desc mb-4 mx-auto">{t("cta:desc")}</p>
          <button className="btn-cta-enroll">{t("cta:enroll")}</button>
        </Container>
      </div>

      {/* Testimonials Reused Block */}
      <div className="testimonials-section py-5">
        <Container className="py-5">
          <h2 className="text-center fw-bold mb-5">
            {t("testimonials:title")}
          </h2>
          <Row className="g-4">
            {teamTestimonialsData &&
              teamTestimonialsData.map((testimonial) => (
                <Col lg={4} md={6} key={testimonial.id}>
                  <div className="testimonial-card">
                    <div className="quote-icon mb-3">
                      <span className="quote-mark">“</span>
                    </div>
                    <div className="d-flex align-items-center mb-4">
                      <img
                        src={studentImg}
                        alt={testimonial.name}
                        className="testimonial-avatar me-3"
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

export default AllContact;
