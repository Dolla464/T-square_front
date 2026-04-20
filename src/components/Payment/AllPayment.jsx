import React, { useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MOCK_DATA } from "../../data/mockData";
import i18n from "../../i18n";
import courseTempImg from "../../assets/course-temp.png";
import "./AllPayment.css";

function AllPayment() {
  const { t } = useTranslation(["payment", "navbar", "courses"]);
  const { id } = useParams();
  const isArabic = i18n.language === "ar";

  // Find course from mock data
  const course = MOCK_DATA.courses.find((c) => c.id === Number(id));
  const instructor = course
    ? MOCK_DATA.instructors.find((i) => i.id === course.instructor_id)
    : null;

  const WHATSAPP_NUMBER = "201021327600";

  // Student form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: isArabic ? "مصر" : "Egypt",
    notes: "",
  });

  // Submission state
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Payment Request Submitted:", {
      ...formData,
      courseId: id,
    });
    setSubmitted(true);
  };

  // Build formatted data string for clipboard / WhatsApp
  const buildFormattedData = () => {
    const lines = [
      ` ${t("payment:submitSection.paymentRequestLabel")}`,
      `━━━━━━━━━━━━━━━━━━`,
      ` ${t("payment:studentInfo.fullName")}: ${formData.fullName}`,
      ` ${t("payment:studentInfo.emailAddress")}: ${formData.email}`,
      ` ${t("payment:studentInfo.phoneNumber")}: ${formData.phone}`,
      ` ${t("payment:studentInfo.country")}: ${formData.country}`,
      formData.notes
        ? ` ${t("payment:studentInfo.optionalNotes")}: ${formData.notes}`
        : null,
      `━━━━━━━━━━━━━━━━━━`,
      ` ${t("payment:submitSection.courseLabel")}: ${courseTitle}`,
      ` ${t("payment:orderSummary.total")}: ${coursePrice} ${priceUnit}`,
      `━━━━━━━━━━━━━━━━━━`,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleWhatsApp = async () => {
    const data = buildFormattedData();
    // Copy to clipboard first
    try {
      await navigator.clipboard.writeText(data);
    } catch (err) {
      console.error("Copy failed:", err);
    }
    // Then open WhatsApp
    const message = encodeURIComponent(data);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  // Fallback values if course not found
  const courseTitle = course?.title || "Complete Web Development Bootcamp 2026";
  const courseDescription =
    "Master modern web development with hands-on projects and real-world applications.";
  const instructorName = instructor?.full_name || "Dr. Sarah Johnson";
  const courseDuration = "42";
  const coursePrice = course?.discount_price || course?.price || 250;
  const priceUnit = t("courses:card.priceUnit");

  return (
    <div className="payment-page">
      <div className="py-5 mt-5">
        <Container>
          {/* Breadcrumbs */}
          <nav className="breadcrumb-nav mb-4 d-flex align-items-center">
            <Link to="/" className="breadcrumb-item">
              {t("navbar:home")}
            </Link>
            <span className="breadcrumb-separator mx-2">
              {isArabic ? (
                <i className="bi bi-chevron-left"></i>
              ) : (
                <i className="bi bi-chevron-right"></i>
              )}
            </span>
            <Link to="/courses" className="breadcrumb-item">
              {t("payment:breadcrumb.courses")}
            </Link>
            <span className="breadcrumb-separator mx-2">
              {isArabic ? (
                <i className="bi bi-chevron-left"></i>
              ) : (
                <i className="bi bi-chevron-right"></i>
              )}
            </span>
            <span className="breadcrumb-item active">
              {t("payment:breadcrumb.payment")}
            </span>
          </nav>

          {/* Main Content */}
          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              {/* Left Column: Student Info + Payment Method */}
              <Col lg={8}>
                {/* Student Information Card */}
                <div className="student-info-card">
                  <h4>{t("payment:studentInfo.title")}</h4>

                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="payment-form-label">
                      <i className="bi bi-person label-icon"></i>
                      {t("payment:studentInfo.fullName")}
                      <span className="required-mark">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      className="payment-input shadow-none"
                      placeholder={t("payment:studentInfo.fullNamePlaceholder")}
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      id="payment-fullname"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="mb-3">
                    <label className="payment-form-label">
                      <i className="bi bi-envelope label-icon"></i>
                      {t("payment:studentInfo.emailAddress")}
                      <span className="required-mark">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="payment-input shadow-none"
                      placeholder={t("payment:studentInfo.emailPlaceholder")}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      id="payment-email"
                    />
                  </div>

                  {/* Phone + Country Row */}
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <label className="payment-form-label">
                        <i className="bi bi-telephone label-icon"></i>
                        {t("payment:studentInfo.phoneNumber")}
                        <span className="required-mark">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className="payment-input shadow-none"
                        placeholder={t("payment:studentInfo.phonePlaceholder")}
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        id="payment-phone"
                      />
                    </Col>
                    <Col md={6}>
                      <label className="payment-form-label">
                        <i className="bi bi-globe label-icon"></i>
                        {t("payment:studentInfo.country")}
                        <span className="required-mark">*</span>
                      </label>
                      <input
                        type="text"
                        name="country"
                        className="payment-input shadow-none"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        id="payment-country"
                      />
                    </Col>
                  </Row>

                  {/* Optional Notes */}
                  <div className="mb-1">
                    <label className="payment-form-label">
                      <i className="bi bi-chat-square-text label-icon"></i>
                      {t("payment:studentInfo.optionalNotes")}
                    </label>
                    <textarea
                      name="notes"
                      className="payment-input payment-textarea shadow-none"
                      placeholder={t("payment:studentInfo.notesPlaceholder")}
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      id="payment-notes"
                    />
                  </div>
                </div>

                {/* Submit Payment Request Section */}
                <div className="payment-submit-section">
                  {submitted ? (
                    <div className="payment-success-card">
                      <div className="payment-success-icon">
                        <i className="bi bi-check-circle-fill"></i>
                      </div>
                      <h4>{t("payment:submitSection.successTitle")}</h4>
                      <p>{t("payment:submitSection.successDesc")}</p>
                      <div className="payment-success-info">
                        <div className="success-info-item">
                          <i className="bi bi-envelope"></i>
                          <span>{t("payment:submitSection.emailNotice")}</span>
                        </div>
                        <div className="success-info-item">
                          <i className="bi bi-clock-history"></i>
                          <span>
                            {t("payment:submitSection.processingTime")}
                          </span>
                        </div>
                      </div>

                      {/* WhatsApp fast-track section */}
                      <div className="whatsapp-section">
                        <p className="whatsapp-hint">
                          {t("payment:submitSection.whatsappHint")}
                        </p>
                        <div className="whatsapp-actions">
                          <button
                            type="button"
                            className="btn-whatsapp"
                            onClick={handleWhatsApp}
                            id="payment-whatsapp-btn"
                          >
                            <i className="bi bi-whatsapp"></i>
                            {t("payment:submitSection.sendWhatsApp")}
                          </button>
                        </div>
                      </div>

                      <Link to="/courses" className="btn-back-courses">
                        {t("payment:submitSection.backToCourses")}
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="btn-complete-payment"
                      id="payment-submit-btn"
                    >
                      {t("payment:submitSection.submitRequest")}
                    </button>
                  )}
                </div>

                {/* Security Badges */}
                {!submitted && (
                  <div className="security-badges">
                    <div className="security-badge">
                      <i className="bi bi-shield-check badge-icon-green"></i>
                      <span>{t("payment:securityBadges.securePayment")}</span>
                    </div>
                    <div className="security-badge">
                      <i className="bi bi-check-circle-fill badge-icon-blue"></i>
                      <span>{t("payment:securityBadges.sslEncrypted")}</span>
                    </div>
                    <div className="security-badge">
                      <i className="bi bi-shield-lock badge-icon-gold"></i>
                      <span>
                        {t("payment:securityBadges.moneyBackGuarantee")}
                      </span>
                    </div>
                  </div>
                )}
              </Col>

              {/* Right Column: Order Summary */}
              <Col lg={4}>
                <div className="order-summary-card">
                  <h5>{t("payment:orderSummary.title")}</h5>

                  {/* Course Image */}
                  <img
                    src={courseTempImg}
                    alt={courseTitle}
                    className="order-summary-image"
                  />

                  {/* Course Title */}
                  <h6 className="order-summary-title">{courseTitle}</h6>

                  {/* Course Description */}
                  <p className="order-summary-desc">{courseDescription}</p>

                  {/* Meta Info */}
                  <div className="order-summary-meta">
                    <div className="order-summary-meta-item">
                      <i className="bi bi-person"></i>
                      <span>{instructorName}</span>
                    </div>
                    <div className="order-summary-meta-item">
                      <i className="bi bi-clock"></i>
                      <span>
                        {courseDuration} {t("payment:orderSummary.hours")}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="order-total-row">
                    <span className="total-label">
                      {t("payment:orderSummary.total")}
                    </span>
                    <span className="total-price">
                      {coursePrice} {priceUnit}
                    </span>
                  </div>

                  {/* Terms */}
                  <p className="order-terms-text">
                    {t("payment:orderSummary.termsText")}{" "}
                    <a href="#terms">
                      {t("payment:orderSummary.termsOfService")}
                    </a>{" "}
                    {t("payment:orderSummary.and")}{" "}
                    <a href="#privacy">
                      {t("payment:orderSummary.privacyPolicy")}
                    </a>
                  </p>
                </div>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </div>
  );
}

export default AllPayment;
