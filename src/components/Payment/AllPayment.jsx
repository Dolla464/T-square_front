import React, { useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { Link, Navigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import "./AllPayment.css";
import { useCourseSlug } from "../../hooks/useCousrsesSlug";
import { useAuth } from "../../contexts/AuthContext";
import { showConfirmCustom } from "../shared/ConfirmDialog/confirmDialog";
import { toastSuccess, toastError } from "../shared/Toaster/toaster";
import usePayment from "../../hooks/usePayment";

function AllPayment() {
  const { slug } = useParams();
  const location = useLocation();
  const isAlreadyEnrolled = location.state?.isEnrolled || false;
  const { courseData, loading, error } = useCourseSlug(slug);
  const { t } = useTranslation(["payment", "navbar", "courses"]);
  const isArabic = i18n.language === "ar";

  if (!slug || slug == null) {
    return <Navigate to="/courses" replace />;
  }

  const course = courseData;
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
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [responseMessage, setResponseMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { createEnrollment } = usePayment();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await showConfirmCustom({
      title: t("confirmTitle"),
      message: t("confirmMessage"),
      confirmText: t("confirm"),
      cancelText: t("cancel"),
      icon: "question",
      variant: "primary",
    });

    if (!confirm) return;

    try {
      const response = await createEnrollment({
        course_id: course.id,
        billing_name: formData.fullName,
        billing_email: formData.email,
        billing_phone: formData.phone,
        notes: formData.notes,
      });

      toastSuccess(t("successMessage"));

      setIsError(false);
      setResponseMessage(response.data.message);

      const whatsappConfirm = await showConfirmCustom({
        title: t("whatsappTitle"),
        message: t("whatsappMessage"),
        confirmText: t("whatsappNow"),
        cancelText: t("whatsappLater"),
        icon: "info",
        variant: "success",
      });

      if (whatsappConfirm) {
        window.open(response.data.whatsapp_link, "_blank");
      }
    } catch (error) {
      // استخلاص رسالة الخطأ من السيرفر بشكل مرن سواء كانت ملقاة ككائن بيانات مباشرة أو كخطأ Axios
      const serverMessage = 
        error?.message || 
        error?.response?.data?.message || 
        (typeof error === "string" ? error : null);

      const errorMessage = serverMessage === "Unauthorized access"
        ? "أنت أدمن ليس لديك صلاحيات شراء كورس"
        : (serverMessage || t("errorMessage"));

      toastError(errorMessage);
      setIsError(true);
      setResponseMessage(errorMessage);
    }
    setSubmitted(true);
  };

  // Build formatted data string for clipboard / WhatsApp
  const WHATSAPP_NUMBER = "201021327600";

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

  const whatsapp = async () => {
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
                        <i
                          className={`bi ${
                            isError
                              ? "bi-x-circle-fill text-danger"
                              : "bi-check-circle-fill text-success"
                          }`}
                        ></i>
                      </div>
                      {isError && (
                        <>
                          <h4>{t("payment:submitSection.paymenterror")}</h4>
                          <p>{responseMessage}</p>
                        </>
                      )}

                      {!isError && (
                        <>
                          <h4> {t("payment:submitSection.successTitle")}</h4>
                          <div className="payment-success-info">
                            <div className="success-info-item">
                              <i className="bi bi-envelope"></i>
                              <span>
                                {t("payment:submitSection.emailNotice")}
                              </span>
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
                                onClick={whatsapp}
                                className="btn-whatsapp"
                                id="payment-whatsapp-btn"
                              >
                                <i className="bi bi-whatsapp"></i>
                                {t("payment:submitSection.sendWhatsApp")}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                      <Link to="/courses" className="btn-back-courses">
                        {t("payment:submitSection.backToCourses")}
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className={`btn-complete-payment ${isAlreadyEnrolled ? "bg-secondary border-0 text-white cursor-not-allowed" : ""}`}
                      id="payment-submit-btn"
                      disabled={isAlreadyEnrolled} // 👈 سيتم قفل الزرار تماماً لو القيمة true
                    >
                      {isAlreadyEnrolled
                        ? isArabic
                          ? "أنت مشترك بالفعل في هذا الكورس"
                          : "You are already enrolled"
                        : t("payment:submitSection.submitRequest")}
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
                    src={course?.image}
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
                      Course level :
                      <span className="fw-bold"> {course?.level}</span>
                    </div>
                    <div className="order-summary-meta-item">
                      <i className="bi bi-calendar-event"></i>
                      <span>
                        Course duration :{" "}
                        <span className="fw-bold">
                          {" "}
                          {course?.duration_hours} h{" "}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div
                    className="order-total-row border-top pt-2 mt-2"
                    dir={isArabic ? "rtl" : "ltr"}
                  >
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
