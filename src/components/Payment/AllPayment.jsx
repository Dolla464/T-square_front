import React, { useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import courseTempImg from "../../assets/course-temp.png";
import "./AllPayment.css";
import { useCourseSlug } from "../../hooks/useCousrsesSlug";
import { useAuth } from "../../contexts/AuthContext";

function AllPayment() {
  const { slug } = useParams();
  const { courseData, loading, error } = useCourseSlug(slug);

  const { t } = useTranslation(["payment", "navbar", "courses"]);
  const isArabic = i18n.language === "ar";
  if (!slug || slug == null) {
    return <Navigate to="/courses" replace />;
  }
  // Find course from mock data
  const course = courseData;

  const WHATSAPP_NUMBER = "201021327600";
  const { user } = useAuth();

  // Student form state
  const [formData, setFormData] = useState({
    fullName: user?.name || user?.student?.full_name || "",
    email: user?.email || "",
    phone: user?.student?.phone || user?.phone || "",
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
      courseId: course.id,
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
      ` ${t("payment:submitSection.courseLabel")}: ${course.title}`,
      ` ${t("payment:orderSummary.total")}: ${course.price.final} ${t("courses:card.priceUnit")}`,
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
                    src={courseTempImg || course.image}
                    alt={course?.title}
                    className="order-summary-image"
                  />

                  {/* Course Title */}
                  <h6 className="order-summary-title" dir="ltr">
                    {course?.title}
                  </h6>

                  {/* Course Description */}
                  <p className="order-summary-desc overflow-hidden " dir="ltr">
                    {course?.short_description}
                  </p>

                  {/* Meta Info */}
                  <div className="order-summary-meta" dir="ltr">
                    <div className="order-summary-meta-item">
                      <i className="bi bi-person"></i>
                      <span>
                        Course instructor :
                        <span className="fw-bold">
                          {course?.instructor?.name}
                        </span>
                      </span>
                    </div>
                    <div className="order-summary-meta-item">
                      <i className="bi bi-translate"></i>
                      Course language :<span className="fw-bold"> {course?.language}</span>
                    </div>
                    <div className="order-summary-meta-item">
                      <i className="bi bi-calendar-event"></i>
                      <span>
                        Course created at :
                        <span className="text-capitalize fw-bold">
                          {course?.created_at}
                        </span>
                      </span>
                    </div>

                  </div>
                  {/* Course Tags */}
                  <div className="course-tags" dir="ltr">
                    {course?.tags?.map((tag) => (
                      <span key={tag.id} className="tag">
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  {/* Price Details */}
                  <div className="order-price-details mt-4 mb-3 border-top pt-3" dir={isArabic ? "rtl" : "ltr"}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">{isArabic ? "السعر الأصلي" : "Original Price"}</span>
                      <span className="text-decoration-line-through text-muted">
                        {course?.price?.original} {t("courses:card.priceUnit")}
                      </span>
                    </div>

                    {course?.price?.discount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>{isArabic ? "الخصم" : "Discount"}</span>
                        <span>- {course?.price?.discount} {t("courses:card.priceUnit")}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="order-total-row border-top pt-2 mt-2" dir={isArabic ? "rtl" : "ltr"}>
                    <span className="total-label fw-bold">
                      {t("payment:orderSummary.total")}
                    </span>
                    <span className="total-price fw-bold text-danger fs-4">
                      {course?.price?.final} {t("courses:card.priceUnit")}
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
