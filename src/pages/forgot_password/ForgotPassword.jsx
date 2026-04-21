import { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp";
import "../../pages/forgot_password/forgot.css";  // css
import { useForgotPassword } from "../../hooks/useForgotPassword";

function ForgotPassword() {
  const { t, i18n } = useTranslation("auth");
  const isArabic = i18n.language === "ar";

  const [email, setEmail] = useState("");
  const { executeForgotPassword, loading, error, successMsg } = useForgotPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await executeForgotPassword(email);
      setEmail(""); // clear email after success
    } catch (err) {
      // error handled in hook
    }
  };
  return (
    <div className="forgot-wrapper" dir={isArabic ? "rtl" : "ltr"}>
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Card className="forgot-card shadow border-0 p-4">
          <Card.Body className="text-center p-0">
            {/* اللوجو */}
            <Link to="/">
              <img
                src={tsquareLogo}
                alt="T-Square Logo"
                className="forgot-logo mb-3"
                title="Back to Home"
              />
            </Link>

            {/* العنوان */}
            <Card.Title className="fw-bold fs-4 mb-4 text-dark forgot-title">
              {t("forgot_form.reset_password")}
            </Card.Title>

            {error && <Alert variant="danger">{isArabic ? "البريد الإلكتروني غير صحيح" : "Invalid email"}</Alert>}
            {successMsg && <Alert variant="success">{isArabic ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" : "Password reset link sent to your email"}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* حقل الإيميل */}
              <Form.Group
                className={`mb-3 forgot-form-group ${isArabic ? "text-end" : "text-start"}`}
              >
                <Form.Label
                  className="forgot-label d-block "
                  style={{ textAlign: isArabic ? "right" : "left" }}
                >
                  {t("forgot_form.email_label")}
                </Form.Label>
                <Form.Control
                  type="email"
                  required
                  placeholder={t("forgot_form.email_placeholder")}
                  className="forgot-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              {/* زر الدخول */}
              <Button
                type="submit"
                className="forgot-btn btn-lg w-100 fs-6 fw-bold"
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : t("forgot_form.send_email")}
              </Button>
            </Form>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default ForgotPassword;
