import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp";
import "../../pages/forgot_password/forgot.css";  // css
import { useForgotPassword } from "../../hooks/useForgotPassword";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "../../utils/validationSchemas";

function ForgotPassword() {
  const { t, i18n } = useTranslation("auth");
  const isArabic = i18n.language === "ar";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { executeForgotPassword, loading, error: apiError, successMsg } = useForgotPassword();

  const onSubmit = async (data) => {
    try {
      await executeForgotPassword(data.email);
      reset(); // Clear form on success
    } catch (err) {
      // Error handled by hook
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

            {apiError && (
              <Alert variant={apiError.type === 'throttle' ? 'warning' : 'danger'} className="d-flex align-items-center gap-2">
                <i className={`bi ${apiError.type === 'throttle' ? 'bi-hourglass-split' : 'bi-exclamation-triangle-fill'}`}></i>
                <div>
                  {apiError.type === 'throttle'
                    ? (isArabic ? 'لقد أرسلت طلبًا مؤخرًا. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.' : 'You recently sent a request. Please wait a moment before trying again.')
                    : (isArabic ? 'البريد الإلكتروني غير صحيح أو غير مسجل' : 'Invalid or unregistered email')}
                </div>
              </Alert>
            )}
            {successMsg && (
              <Alert variant="success" className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill"></i>
                <div>
                  {isArabic 
                    ? "تم إرسال رابط إعادة تعيين كلمة المرور بنجاح. يرجى التحقق من بريدك الإلكتروني (بما في ذلك البريد العشوائي)." 
                    : "Password reset link sent successfully. Please check your email (including spam folder)."}
                </div>
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
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
                  placeholder={t("forgot_form.email_placeholder")}
                  className={`forgot-input ${errors.email ? "is-invalid" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <Form.Control.Feedback type="invalid">
                    {errors.email.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* زر الإرسال */}
              <Button
                type="submit"
                className="forgot-btn btn-lg w-100 fs-6 fw-bold"
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : t("forgot_form.send_email")}
              </Button>
              
              <div className="mt-3">
                <Link to="/login" className="text-muted text-decoration-none small">
                  {isArabic ? "العودة لتسجيل الدخول" : "Back to Login"}
                </Link>
              </div>
            </Form>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default ForgotPassword;
