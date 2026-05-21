import { Container, Card, Form, Button, Nav, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp";
import "./Signup.css";
import { useRegister } from "../../hooks/useRegister";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../utils/validationSchemas";

function SignupPage() {
  const { t, i18n } = useTranslation("auth");
  const isArabic = i18n.language === "ar";
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "student",
    },
  });

  const { executeRegister, loading, error: apiError, successMsg } = useRegister();

  const onSubmit = async (data) => {
    try {
      await executeRegister(data);
    } catch (err) {
      // Handled by hook
    }
  };

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

            {apiError && <Alert variant="danger">{apiError}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}
            
            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* حقل الاسم */}
              <Form.Group className="mb-3 signup-form-group">
                <Form.Label className="signup-label">
                  {t("signup_form.name_label")}
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t("signup_form.name_placeholder")}
                  className={`signup-input ${errors.full_name ? "is-invalid" : ""}`}
                  {...register("full_name")}
                />
                {errors.full_name && (
                  <Form.Control.Feedback type="invalid">
                    {errors.full_name.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* حقل رقم الهاتف */}
              <Form.Group className="mb-3 signup-form-group">
                <Form.Label className="signup-label">
                  {t("signup_form.phone_label")}
                </Form.Label>
                <Form.Control
                  type="tel"
                  placeholder={t("signup_form.phone_placeholder")}
                  className={`signup-input ${errors.phone ? "is-invalid" : ""}`}
                  {...register("phone")}
                />
                {errors.phone && (
                  <Form.Control.Feedback type="invalid">
                    {errors.phone.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* حقل الإيميل */}
              <Form.Group className="mb-3 signup-form-group">
                <Form.Label className="signup-label">
                  {t("signup_form.email_label")}
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder={t("signup_form.email_placeholder")}
                  className={`signup-input ${errors.email ? "is-invalid" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <Form.Control.Feedback type="invalid">
                    {errors.email.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* حقل الباسورد */}
              <Form.Group className="mb-4 signup-form-group">
                <Form.Label className="signup-label">
                  {t("signup_form.password_label")}
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder={t("signup_form.password_placeholder")}
                  className={`signup-input ${errors.password ? "is-invalid" : ""}`}
                  {...register("password")}
                />
                {errors.password && (
                  <Form.Control.Feedback type="invalid">
                    {errors.password.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* حقل تأكيد الباسورد */}
              <Form.Group className="mb-4 signup-form-group">
                <Form.Label className="signup-label">
                  {isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder={isArabic ? "أعد إدخال كلمة المرور" : "Confirm your password"}
                  className={`signup-input ${errors.password_confirmation ? "is-invalid" : ""}`}
                  {...register("password_confirmation")}
                />
                {errors.password_confirmation && (
                  <Form.Control.Feedback type="invalid">
                    {errors.password_confirmation.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* زر التسجيل */}
              <Button
                type="submit"
                className="signup-btn btn-lg w-100 fs-6 fw-bold"
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : t("signup_form.signup_btn")}
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
