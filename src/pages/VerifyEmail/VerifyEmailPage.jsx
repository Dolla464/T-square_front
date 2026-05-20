import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { verifyEmail, resendVerificationNotification } from "../../services/register";
import { useTranslation } from "react-i18next";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import tsquareLogo from "../../assets/logo-dark.webp"; 
import "../Login/Login.css"; // Reuse login wrapper styling
import "./VerifyEmailPage.css";

// Keep track of active verifications to prevent concurrent duplicate requests in Strict Mode
const activeVerifications = new Set();

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const hash = searchParams.get("hash");
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");
  
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation("auth");
  const isArabic = i18n.language === "ar";
  
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If not logged in, redirect to login with returnUrl
    if (!user) {
      toast.error(isArabic ? "الرجاء تسجيل الدخول أولاً لتفعيل حسابك" : "Please login first to verify your account");
      navigate("/login", { state: { returnUrl: location.pathname + location.search } });
      return;
    }

    // Prevent duplicate API calls
    const verificationKey = `${id}-${hash}-${expires}-${signature}`;
    if (activeVerifications.has(verificationKey)) return;
    activeVerifications.add(verificationKey);

    // If already verified
    if (user.is_verified === true || user.is_verified === "true" || user.is_verified === 1) {
      setStatus("success");
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail(id, hash, expires, signature);
        
        // Update user state context
        updateUser({ ...user, is_verified: true });
        
        setStatus("success");
        toast.success(isArabic ? "تم تفعيل حسابك بنجاح!" : "Account verified successfully!");
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/student/dashboard");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        activeVerifications.delete(verificationKey);
        setStatus("error");
        setErrorMessage(
          error.response?.data?.message || 
          (isArabic ? "فشل تفعيل الحساب. قد يكون الرابط منتهياً." : "Verification failed. The link might be expired.")
        );
      }
    };

    if (id && hash && expires && signature) {
      performVerification();
    } else {
      setStatus("error");
      setErrorMessage(isArabic ? "رابط التفعيل غير صالح أو غير مكتمل." : "Invalid or incomplete verification link.");
    }
  }, [user, authLoading, id, hash, expires, signature, navigate, location, isArabic, updateUser]);

  const handleResend = async () => {
    try {
      setIsResending(true);
      await resendVerificationNotification();
      toast.success(isArabic ? "تم إرسال رابط تفعيل جديد إلى بريدك الإلكتروني." : "A new verification link has been sent to your email.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        (isArabic ? "حدث خطأ أثناء محاولة إرسال الرابط. يرجى المحاولة لاحقاً." : "An error occurred while resending the link. Please try again later.")
      );
    } finally {
      setIsResending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="login-wrapper" dir={isArabic ? "rtl" : "ltr"}>
        <Container className="d-flex justify-content-center align-items-center h-100">
          <Spinner animation="border" variant="danger" />
        </Container>
      </div>
    );
  }

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
                className="login-logo mb-4"
                title={isArabic ? "العودة للرئيسية" : "Back to Home"}
              />
            </Link>

            {status === "loading" && (
              <div className="py-4">
                <Spinner animation="border" variant="danger" className="mb-3" style={{ width: "3rem", height: "3rem" }} />
                <h4 className="fw-bold text-dark">{isArabic ? "جاري تفعيل حسابك..." : "Verifying your account..."}</h4>
                <p className="text-muted">{isArabic ? "يرجى الانتظار لحظات، يتم الآن تأكيد حسابك." : "Please wait a moment while we verify your account."}</p>
              </div>
            )}

            {status === "success" && (
              <div className="py-4">
                <i className="bi bi-check-circle-fill text-success mb-3 d-block" style={{ fontSize: "4rem" }}></i>
                <h4 className="fw-bold text-dark">{isArabic ? "تم التفعيل بنجاح!" : "Successfully Verified!"}</h4>
                <p className="text-muted mb-4">{isArabic ? "لقد تم تفعيل حسابك بنجاح. سيتم توجيهك إلى لوحة التحكم الآن." : "Your account has been verified successfully. You will be redirected to the dashboard now."}</p>
                <Button 
                  variant="danger" 
                  className="w-100 fw-bold py-2"
                  onClick={() => navigate("/student/dashboard")}
                >
                  {isArabic ? "الانتقال للوحة التحكم" : "Go to Dashboard"}
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="py-4">
                <i className="bi bi-x-circle-fill text-danger mb-3 d-block" style={{ fontSize: "4rem" }}></i>
                <h4 className="fw-bold text-dark">{isArabic ? "فشل التفعيل" : "Verification Failed"}</h4>
                <p className="text-muted mb-4">{errorMessage}</p>
                <Button 
                  variant="danger" 
                  className="w-100 fw-bold py-2 mb-3"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      {isArabic ? "جاري الإرسال..." : "Sending..."}
                    </>
                  ) : (
                    isArabic ? "إعادة إرسال رابط التفعيل" : "Resend Verification Link"
                  )}
                </Button>
                <Link to="/student/dashboard" className="text-muted text-decoration-none">
                  {isArabic ? "العودة للوحة التحكم" : "Back to Dashboard"}
                </Link>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default VerifyEmailPage;

