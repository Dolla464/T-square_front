import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Nav,
  Alert,
  Spinner,
  InputGroup, // 💥 تم إضافة InputGroup هنا لتنسيق زر العين
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { login, user } = useAuth();
  const { executeLogin, loading, error: apiError } = useLogin();
  const [rememberMe, setRememberMe] = useState(true);

  // 💥 الـ State السحرية للتحكم في ظهور كلمة المرور
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from || "/";

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

  useEffect(() => {
    if (user) {
      if (location.state?.from) {
        navigate(location.state.from, { replace: true });
      } else {
        if (user.role === "instructor") {
          navigate("/instructor", { replace: true });
        } else if (user.role === "student") {
          navigate("/student", { replace: true });
        } else if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    }
  }, [user, navigate, location.state]);

  const handleInstructorBypass = () => {
    const mockAdminData = {
      token: "mock-token-admin",
      user: {
        id: 1,
        name: "Instructor User",
        email: "instructor@test.com",
        role: "instructor",
        phone: "12345678",
        is_active: true,
        email_verified_at: "2026-04-22T13:54:21.000000Z",
      },
    };
    login(mockAdminData, true);
  };

  const onSubmit = async (data) => {
    try {
      await executeLogin(data, rememberMe);
    } catch (err) {
      console.error("Login component execution error: ", err);
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

              {/* حقل الباسورد (💥 تم التعديل هنا باستخدام InputGroup و الـ Eye Button) */}
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

                <InputGroup className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"} // ديناميكي بناءً على الـ State
                    placeholder={t("login_form.password_placeholder")}
                    className={`login-input ${errors.password ? "is-invalid" : ""}`}
                    style={{
                      paddingLeft: isArabic ? "45px" : "12px",
                      paddingRight: isArabic ? "12px" : "45px",
                    }} // تأمين مساحة العين حسب اللغة لكي لا تغطي على النص
                    {...register("password")}
                  />

                  {/* زر العين الشفاف المدمج هندسياً داخل الـ Input */}
                  <Button
                    variant="link"
                    className="position-absolute text-danger p-0 d-flex align-items-center"
                    style={{
                      top: "50%",
                      transform: "translateY(-50%)",
                      left: isArabic ? "15px" : "auto",
                      right: isArabic ? "auto" : "15px",
                      zIndex: 5,
                      textDecoration: "none",
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1" // تخطي الزر عند استخدام زر Tab لتجربة مستخدم احترافية
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"} fs-5`}
                    ></i>
                  </Button>

                  {errors.password && (
                    <Form.Control.Feedback type="invalid" className="d-block">
                      {errors.password.message}
                    </Form.Control.Feedback>
                  )}
                </InputGroup>
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
                onClick={handleInstructorBypass}
                style={{ borderStyle: "dashed" }}
              >
                {isArabic
                  ? "دخول سريع (Instructor)"
                  : "Quick Login (Instructor)"}
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
