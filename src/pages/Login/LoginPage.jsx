import { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Nav,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp"; 
import "./Login.css"; 
import { useLogin } from "../../hooks/useLogin";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../utils/validationSchemas";

function LoginPage() {
  const { t, i18n } = useTranslation("auth");
  const isArabic = i18n.language === "ar";
  const navigate = useNavigate();
  const { login } = useAuth();
  const { executeLogin, loading, error: apiError } = useLogin();
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ── زر مؤقت للدخول بـ Role Admin للمعاينة ──
  const handleAdminBypass = () => {
    const mockAdminData = {
      token: "mock-token-admin",
      user: {
        id: 1,
        name: "Admin User",
        email: "admin@tsquare.com",
        role: "admin",
        phone: "01016981295",
        is_active: true,
        email_verified_at: "2026-04-22T13:54:21.000000Z",
      },
    };
    login(mockAdminData, true);
    navigate("/admin");
  };

  const handleStudentBypass = () => {
    const mockAdminData = {
      token: "mock-token-admin",
      user: {
        id: 1,
        name: "Student User",
        email: "student@tsquare.com",
        role: "student",
        is_active: true,
        phone: "01016981295",
        email_verified_at: null,
      },
    };
    login(mockAdminData, true);
    navigate("/student/dashboard");
  };

  const onSubmit = async (data) => {
    try {
      await executeLogin(data, rememberMe);
    } catch (err) {
      // Error state is managed by the hook
    }
  };

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

            {apiError && (
              <Alert variant="danger">
                {isArabic
                  ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
                  : "Invalid email or password"}
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
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
                  className={`login-input ${errors.email ? "is-invalid" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <Form.Control.Feedback type="invalid">
                    {errors.email.message}
                  </Form.Control.Feedback>
                )}
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
                    to="/forgot_password"
                    className="forgot-link p-0 login-accent-text"
                  >
                    {t("login_form.forgot_password")}
                  </Nav.Link>
                </div>
                <Form.Control
                  type="password"
                  placeholder={t("login_form.password_placeholder")}
                  className={`login-input ${errors.password ? "is-invalid" : ""}`}
                  {...register("password")}
                />
                {errors.password && (
                  <Form.Control.Feedback type="invalid">
                    {errors.password.message}
                  </Form.Control.Feedback>
                )}
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
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              </Form.Group>

              {/* زر الدخول */}
              <Button
                type="submit"
                className="login-btn btn-lg w-100 fs-6 fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  t("login_form.sign_in_btn")
                )}
              </Button>

              {/* زر مؤقت للمطور للدخول كمسؤول */}
              <Button
                variant="outline-dark"
                className="w-100 mt-3 border-secondary"
                onClick={handleAdminBypass}
                style={{ borderStyle: "dashed" }}
              >
                {isArabic ? "دخول سريع (Admin)" : "Quick Login (Admin)"}
              </Button>
              <Button
                variant="outline-dark"
                className="w-100 mt-3 border-secondary"
                onClick={handleStudentBypass}
                style={{ borderStyle: "dashed" }}
              >
                {isArabic ? "دخول سريع (Student)" : "Quick Login (Student)"}
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
