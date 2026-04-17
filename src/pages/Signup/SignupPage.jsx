import { Container, Card, Form, Button, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp";
import "./Signup.css";
import i18n from "../../i18n";

function SignupPage() {
  const { t } = useTranslation("auth");
  const isArabic = i18n.language === "ar";

  return (
    <div className="signup-wrapper" dir={isArabic ? "rtl" : "ltr"}>
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Card className="signup-card shadow border-0 p-4">
          <Card.Body className="text-center p-0">
            {/* اللوجو */}
            <Link to="/">
              <img
                src={tsquareLogo}
                alt="T-Square Logo"
                className="signup-logo mb-3"
                title="Back to Home"
              />
            </Link>

            {/* العنوان */}
            <Card.Title className="fw-bold fs-4 mb-4 text-dark signup-title">
              {t("signup_form.title")}
            </Card.Title>

            <Form>
              {/* حقل الاسم */}
              <Form.Group className="mb-3  signup-form-group">
                <Form.Label className="signup-label">
                  {t("signup_form.name_label")}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t("signup_form.name_placeholder")}
                  className="signup-input"
                />
              </Form.Group>

              {/* حقل رقم الهاتف */}
              <Form.Group className="mb-3  signup-form-group">
                <Form.Label className="signup-label">
                  {t("signup_form.phone_label")}
                </Form.Label>
                <Form.Control
                  type="tel"
                  placeholder={t("signup_form.phone_placeholder")}
                  className="signup-input"
                />
              </Form.Group>

              {/* حقل الإيميل */}
              <Form.Group className="mb-3  signup-form-group">
                <Form.Label className="signup-label">
                  {t("signup_form.email_label")}
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder={t("signup_form.email_placeholder")}
                  className="signup-input"
                />
              </Form.Group>

              {/* حقل الباسورد */}
              <Form.Group className="mb-4  signup-form-group">
                <Form.Label className="signup-label">
                  {t("signup_form.password_label")}
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder={t("signup_form.password_placeholder")}
                  className="signup-input"
                />
              </Form.Group>

              {/* زر التسجيل */}
              <Button
                type="submit"
                className="signup-btn btn-lg w-100 fs-6 fw-bold"
              >
                {t("signup_form.signup_btn")}
              </Button>
            </Form>

            {/* العودة لتسجيل الدخول */}
            <Card.Footer className="bg-transparent text-center border-0 mt-3 p-0 signup-footer-text">
              <span className="text-muted">
                {t("signup_form.login_prompt")}
              </span>
              <Nav.Link
                as={Link}
                to="/login"
                className="d-inline p-0 text-danger signup-accent-text"
              >
                {t("signup_form.login_link")}
              </Nav.Link>
            </Card.Footer>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default SignupPage;
