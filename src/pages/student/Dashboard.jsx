import { Container, Alert, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { resendVerificationNotification } from '../../services/register';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation("user");
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    try {
      setIsResending(true);
      await resendVerificationNotification();
      toast.success(t("verification_link_sent") || "تم إرسال رابط تفعيل جديد إلى بريدك الإلكتروني.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        t("resend_failed") || 
        "حدث خطأ أثناء محاولة إرسال الرابط. يرجى المحاولة لاحقاً."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
      <Button
        as={Link}
        to="/"
        variant="danger"
        className="mb-3 px-4 py-2 fw-bold rounded-pill"
      >
        Go back (T-Square)
      </Button>
      {/* رسالة في حالة عدم التفعيل */}
      {user &&
        user.hasOwnProperty("is_verified") &&
        String(user.is_verified) !== "true" && (
          <Alert
            variant="warning"
            className="text-center mb-4 w-100 shadow-sm"
            style={{ maxWidth: "600px", borderRadius: "10px" }}
          >
            <Alert.Heading className="mb-3 text-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {t("not_activated")}
            </Alert.Heading>
            <p className="fs-5">{t("not_activated_msg")}</p>
            
            <Button 
              variant="outline-danger" 
              className="mt-2 fw-bold"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  {t("sending") || "جاري الإرسال..."}
                </>
              ) : (
                t("resend_verification_link") || "إعادة إرسال رابط التفعيل"
              )}
            </Button>
          </Alert>
        )}

      <div
        style={{
          backgroundColor: "#ffcccc",
          border: "2px solid red",
          padding: "2rem",
          borderRadius: "10px",
          textAlign: "center",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <h1 style={{ color: "red", margin: 0 }}>Student Dashboard</h1>
      </div>
    </Container>
  );
};

export default StudentDashboard;
