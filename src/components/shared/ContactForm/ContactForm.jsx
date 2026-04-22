import React, { useState } from "react";
import { Form, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useContact } from "../../../hooks/useContact";
import "./ContactForm.css";
import i18n from "../../../i18n";
import { useAuth } from "../../../contexts/AuthContext";

function ContactForm({ title, subtitle, onSubmit, submitText, externalLoading }) {
  const { t } = useTranslation(["contact"]);
  const { submitContact, loading: hookLoading, error, success } = useContact();
  const isArabic = i18n.language === "ar";
  const loading = externalLoading || hookLoading;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    learning_track: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If a custom onSubmit is provided (e.g. for analytics or parent logic), use it
    if (onSubmit) {
      onSubmit(formData);
    } else {
      // Default behavior: use the hook to connect to API
      try {
        await submitContact(formData);
        // Clear form on success
        setFormData({ name: "", email: "", phone: "", learning_track: "", message: "" });
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  return (
    <div className="shared-contact-form">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="fw-bold mb-3">{title}</h3>}
          {subtitle && <p className="text-muted mb-4">{subtitle}</p>}
        </div>
      )}

      {error && <Alert variant="danger" className="mb-4">{isArabic ? "هذا البريد الإلكتروني تم إرساله مسبقاً" : "This email has already been submitted"}</Alert>}
      {success && <Alert variant="success" className="mb-4">{isArabic ? "تم إرسال رسالتك بنجاح" : "Message sent successfully"}</Alert>}

      {/* Reusable Form */}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4" controlId="contactName">
          <Form.Control
            type="text"
            name="name"
            placeholder={t("contact:form.name")}
            className="custom-input shadow-none"
            value={user?.name || formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </Form.Group>
        <Form.Group className="mb-4" controlId="contactEmail">
          <Form.Control
            type="email"
            name="email"
            placeholder={t("contact:form.emailAddress")}
            className="custom-input shadow-none"
            value={user?.email || formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </Form.Group>
        <Form.Group className="mb-4" controlId="contactPhone">
          <Form.Control
            type="tel"
            name="phone"
            placeholder={t("contact:form.phoneNumber")}
            className="custom-input shadow-none"
            value={user?.phone || formData.phone}
            onChange={handleChange}
            disabled={loading}
          />
        </Form.Group>
        <Form.Group className="mb-4" controlId="contactTrack">
          <Form.Control
            type="text"
            name="learning_track"
            placeholder={t("contact:form.track")}
            className="custom-input shadow-none"
            value={formData.learning_track}
            onChange={handleChange}
            disabled={loading}
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
            disabled={loading}
          />
        </Form.Group>

        <button
          type="submit"
          className="btn-shared-submit w-100 mt-2"
          disabled={loading}
        >
          {loading ? (
            <div className="spinner-border spinner-border-sm text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            submitText || t("contact:form.send")
          )}
        </button>
      </Form>
    </div>
  );
}

export default ContactForm;
