import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp"; 
import "../../pages/Update_Password/UpdatePassword.css"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema } from "../../utils/validationSchemas";
import { useState } from "react";
import toast from "react-hot-toast";
import { useResetPassword } from "../../hooks/useResetPassword";

function UpdatePassword() {
  const { t, i18n } = useTranslation("auth");
  const isArabic = i18n.language === "ar";
  const [searchParams] = useSearchParams();
  const { token } = useParams();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const { executeResetPassword, loading } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      email: searchParams.get("email") || "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const email = searchParams.get("email") || "";
      await executeResetPassword({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      toast.success(isArabic ? "تم تحديث كلمة المرور بنجاح" : "Password updated successfully");
      navigate("/login");
    } catch (err) {
      const responseData = err.response?.data;
      let errorMsg = responseData?.message || responseData?.error || (isArabic ? "فشل تحديث كلمة المرور" : "Failed to update password");
      if (responseData?.errors) {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        const firstError = responseData.errors[firstErrorKey];
        errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      setApiError(errorMsg);
    }
  };

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

            {apiError && <Alert variant="danger">{apiError}</Alert>}

            <Form onSubmit={handleSubmit(onSubmit)}>
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
                  placeholder={t("update_password.email_placeholder")}
                  className={`update-input ${errors.email ? "is-invalid" : ""}`}
                  disabled={true}
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
                  placeholder={t("update_password.password_placeholder")}
                  className={`update-input ${errors.password ? "is-invalid" : ""}`}
                  {...register("password")}
                />
                {errors.password && (
                  <Form.Control.Feedback type="invalid">
                    {errors.password.message}
                  </Form.Control.Feedback>
                )}

                <Form.Label
                  className="update-label d-block mt-3"
                  style={{ textAlign: isArabic ? "right" : "left" }}
                >
                  {t("update_password.confirm_password")}
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder={t("update_password.confirm_placeholder")}
                  className={`update-input ${errors.password_confirmation ? "is-invalid" : ""}`}
                  {...register("password_confirmation")}
                />
                {errors.password_confirmation && (
                  <Form.Control.Feedback type="invalid">
                    {errors.password_confirmation.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              {/* زر التحديث */}
              <Button
                type="submit"
                className="update-btn btn-lg w-100 fs-6 fw-bold"
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : t("update_password.update_password")}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default UpdatePassword;
