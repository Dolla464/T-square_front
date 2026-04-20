import { Container, Card, Form, Button, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp"; // تأكد من مسار اللوجو
import "../../pages/Update_Password/UpdatePassword.css"; // css

function UpdatePassword() {
  const { t, i18n } = useTranslation("auth");
  const isArabic = i18n.language === "ar";
  return (
    <div className="update-wrapper" dir={isArabic ? "rtl" : "ltr"}>
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Card className="update-card shadow border-0 p-4">
          <Card.Body className="text-center p-0">
            {/* اللوجو */}
            <Link to="/">
              <img
                src={tsquareLogo}
                alt="T-Square Logo"
                className="update-logo mb-3"
                title="Back to Home"
              />
            </Link>

            {/* العنوان */}
            <Card.Title className="fw-bold fs-4 mb-4 text-dark update-title">
              {t("update_password.create_password")}
            </Card.Title>

            <Form>
              {/* حقل الإيميل */}
              <Form.Group
                className={`mb-3 update-form-group ${isArabic ? "text-end" : "text-start"}`}
              >
                <Form.Label
                  className="update-label d-block "
                  style={{ textAlign: isArabic ? "right" : "left" }}
                >
                  {t("update_password.email_label")}
                </Form.Label>
                <Form.Control
                  type="email"
                  required
                  placeholder={t("update_password.email_placeholder")}
                  className="update-input"
                />
              </Form.Group>

              {/* حقل الباسورد */}
              <Form.Group
                className={`mb-3 update-form-group ${isArabic ? "text-end" : "text-start"}`}
              >
                <Form.Label
                  className="update-label d-block "
                  style={{ textAlign: isArabic ? "right" : "left" }}
                >
                  {t("update_password.password_label")}
                </Form.Label>

                <Form.Control
                  type="password"
                  required
                  placeholder={t("update_password.password_placeholder")}
                  className="update-input"
                />
                <Form.Label
                  className="update-label d-block mt-3"
                  style={{ textAlign: isArabic ? "right" : "left" }}
                >
                  {t("update_password.confirm_password")}
                </Form.Label>
                <Form.Control
                  type="password"
                  required
                  placeholder={t("update_password.confirm_placeholder")}
                  className="update-input"
                />
              </Form.Group>


              {/* زر الدخول */}
              <Button
                type="submit"
                className="update-btn btn-lg w-100 fs-6 fw-bold"
              >
                {t("update_password.update_password")}
              </Button>
            </Form>



          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default UpdatePassword;
