import { Container, Card, Form, Button, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp"; // تأكد من مسار اللوجو
import "./Login.css"; // ملف الـ CSS المرفق في الأسفل

function LoginPage() {
  const { t, i18n } = useTranslation("auth");
  const isArabic = i18n.language === "ar";
  return (
    <div className="login-wrapper" dir={isArabic ? "rtl" : "ltr"}>
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Card className="login-card shadow border-0 p-4">
          <Card.Body className="text-center p-0">
            {/* اللوجو */}
            <Link to="/">
              <img
                src={tsquareLogo}
                alt="T-Square Logo"
                className="login-logo mb-3"
                title="Back to Home"
              />
            </Link>

            {/* العنوان */}
            <Card.Title className="fw-bold fs-4 mb-4 text-dark login-title">
              {t("login_form.title")}
            </Card.Title>

            <Form>
              {/* حقل الإيميل */}
              <Form.Group
                className={`mb-3 login-form-group ${isArabic ? "text-end" : "text-start"}`}
              >
                <Form.Label
                  className="login-label d-block "
                  style={{ textAlign: isArabic ? "right" : "left" }}
                >
                  {t("login_form.email_label")}
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder={t("login_form.email_placeholder")}
                  className="login-input"
                />
              </Form.Group>

              {/* حقل الباسورد */}
              <Form.Group
                className={`mb-3 login-form-group ${isArabic ? "text-end" : "text-start"}`}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="login-label">
                    {t("login_form.password_label")}
                  </Form.Label>
                  <Nav.Link
                    as={Link}
                    to="/forgot-password"
                    className="forgot-link p-0 login-accent-text"
                  >
                    {t("login_form.forgot_password")}
                  </Nav.Link>
                </div>
                <Form.Control
                  type="password"
                  placeholder={t("login_form.password_placeholder")}
                  className="login-input"
                />
              </Form.Group>

              {/* Remember me */}
              <Form.Group
                className={`mb-3 login-form-group ${isArabic ? "text-end" : "text-start"}`}
              >
                <Form.Check
                  type="checkbox"
                  id="remember-me"
                  label={t("login_form.remember_me")}
                  className="d-flex align-items-center gap-2 login-remember-group"
                />
              </Form.Group>

              {/* زر الدخول */}
              <Button
                type="submit"
                className="login-btn btn-lg w-100 fs-6 fw-bold"
              >
                {t("login_form.sign_in_btn")}
              </Button>
            </Form>

            {/* تسجيل حساب جديد */}
            <Card.Footer className="bg-transparent text-center border-0 mt-3 p-0 login-footer-text">
              <span className="text-muted">
                {t("login_form.signup_prompt")}
              </span>
              <Nav.Link
                as={Link}
                to="/signup"
                className="d-inline p-0 text-danger login-accent-text"
              >
                {t("login_form.signup_link")}
              </Nav.Link>
            </Card.Footer>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default LoginPage;
