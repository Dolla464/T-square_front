import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { verifyEmail, resendVerificationNotification } from "../../services/register";
import { useTranslation } from "react-i18next";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import { safeReturnUrl } from "../../utils/safeReturnUrl";
import tsquareLogo from "../../assets/logo-dark.webp"; 
import "../Login/Login.css"; // Reuse login wrapper styling
import "./VerifyEmailPage.css";

// Keep track of active verifications to prevent concurrent duplicate requests in Strict Mode
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
      toast.error(isArabic ? "Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹ Ù„ØªÙØ¹ÙŠÙ„ Ø­Ø³Ø§Ø¨Ùƒ" : "Please login first to verify your account");
      navigate("/login", { state: { returnUrl: safeReturnUrl(location.pathname + location.search) } });
      return;
    }

    // Prevent duplicate API calls (React 19 Strict Mode)
    if (verificationAttempted.current) return;

    // If already verified
    if (user.is_verified === true || user.is_verified === "true" || user.is_verified === 1) {
      setStatus("success");
      return;
    }

    const performVerification = async () => {
      verificationAttempted.current = true;
      try {
        await verifyEmail(id, hash, expires, signature);
        
        // Update user state context
        updateUser({ ...user, is_verified: true });
        
        setStatus("success");
        toast.success(isArabic ? "ØªÙ… ØªÙØ¹ÙŠÙ„ Ø­Ø³Ø§Ø¨Ùƒ Ø¨Ù†Ø¬Ø§Ø­!" : "Account verified successfully!");
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/student/dashboard");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        // Reset flag if it was a network error or something that might be retried
        // But usually, a 400 from a used token shouldn't be retried
        setStatus("error");
        setErrorMessage(
          error.response?.data?.message || 
          (isArabic ? "ÙØ´Ù„ ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨. Ù‚Ø¯ ÙŠÙƒÙˆÙ† Ø§Ù„Ø±Ø§Ø¨Ø· Ù…Ù†ØªÙ‡ÙŠØ§Ù‹." : "Verification failed. The link might be expired.")
        );
      }
    };

    if (id && hash && expires && signature) {
      performVerification();
    } else {
      setStatus("error");
      setErrorMessage(isArabic ? "Ø±Ø§Ø¨Ø· Ø§Ù„ØªÙØ¹ÙŠÙ„ ØºÙŠØ± ØµØ§Ù„Ø­ Ø£Ùˆ ØºÙŠØ± Ù…ÙƒØªÙ…Ù„." : "Invalid or incomplete verification link.");
    }
  }, [user, authLoading, id, hash, expires, signature, navigate, location, isArabic, updateUser]);

  const handleResend = async () => {
    try {
      setIsResending(true);
      await resendVerificationNotification();
      toast.success(isArabic ? "ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø±Ø§Ø¨Ø· ØªÙØ¹ÙŠÙ„ Ø¬Ø¯ÙŠØ¯ Ø¥Ù„Ù‰ Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ." : "A new verification link has been sent to your email.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        (isArabic ? "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ù…Ø­Ø§ÙˆÙ„Ø© Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø§Ø¨Ø·. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù„Ø§Ø­Ù‚Ø§Ù‹." : "An error occurred while resending the link. Please try again later.")
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
            {/* Ø§Ù„Ù„ÙˆØ¬Ùˆ */}
            <Link to="/">
              <img
                src={tsquareLogo}
                alt="T-Square Logo"
                className="login-logo mb-4"
                title={isArabic ? "Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©" : "Back to Home"}
              />
            </Link>

            {status === "loading" && (
              <div className="py-4">
                <Spinner animation="border" variant="danger" className="mb-3" style={{ width: "3rem", height: "3rem" }} />
                <h4 className="fw-bold text-dark">{isArabic ? "Ø¬Ø§Ø±ÙŠ ØªÙØ¹ÙŠÙ„ Ø­Ø³Ø§Ø¨Ùƒ..." : "Verifying your account..."}</h4>
                <p className="text-muted">{isArabic ? "ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø± Ù„Ø­Ø¸Ø§ØªØŒ ÙŠØªÙ… Ø§Ù„Ø¢Ù† ØªØ£ÙƒÙŠØ¯ Ø­Ø³Ø§Ø¨Ùƒ." : "Please wait a moment while we verify your account."}</p>
              </div>
            )}

            {status === "success" && (
              <div className="py-4">
                <i className="bi bi-check-circle-fill text-success mb-3 d-block" style={{ fontSize: "4rem" }}></i>
                <h4 className="fw-bold text-dark">{isArabic ? "ØªÙ… Ø§Ù„ØªÙØ¹ÙŠÙ„ Ø¨Ù†Ø¬Ø§Ø­!" : "Successfully Verified!"}</h4>
                <p className="text-muted mb-4">{isArabic ? "Ù„Ù‚Ø¯ ØªÙ… ØªÙØ¹ÙŠÙ„ Ø­Ø³Ø§Ø¨Ùƒ Ø¨Ù†Ø¬Ø§Ø­. Ø³ÙŠØªÙ… ØªÙˆØ¬ÙŠÙ‡Ùƒ Ø¥Ù„Ù‰ Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ø¢Ù†." : "Your account has been verified successfully. You will be redirected to the dashboard now."}</p>
                <Button 
                  variant="danger" 
                  className="w-100 fw-bold py-2"
                  onClick={() => navigate("/student/dashboard")}
                >
                  {isArabic ? "Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ù„Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…" : "Go to Dashboard"}
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="py-4">
                <i className="bi bi-x-circle-fill text-danger mb-3 d-block" style={{ fontSize: "4rem" }}></i>
                <h4 className="fw-bold text-dark">{isArabic ? "ÙØ´Ù„ Ø§Ù„ØªÙØ¹ÙŠÙ„" : "Verification Failed"}</h4>
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
                      {isArabic ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„..." : "Sending..."}
                    </>
                  ) : (
                    isArabic ? "Ø¥Ø¹Ø§Ø¯Ø© Ø¥Ø±Ø³Ø§Ù„ Ø±Ø§Ø¨Ø· Ø§Ù„ØªÙØ¹ÙŠÙ„" : "Resend Verification Link"
                  )}
                </Button>
                <Link to="/student/dashboard" className="text-muted text-decoration-none">
                  {isArabic ? "Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…" : "Back to Dashboard"}
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



