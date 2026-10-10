import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { verifyEmail, resendVerificationNotification } from "../../services/register";
import { useTranslation } from "react-i18next";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { toastSuccess, toastError } from "../../components/shared/Toaster/toaster";
import { safeReturnUrl } from "../../utils/safeReturnUrl";
import tsquareLogo from "../../assets/logo-dark.webp"; 
import "../Login/Login.css";
import "./VerifyEmailPage.css";
import { isArabicLocale } from "../../utils/isArabicLocale";


// Keep track of active verifications to prevent concurrent duplicate requests in Strict Mode
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const hash = searchParams.get("hash");
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");
  
  const { user, authInitializing, userSynced, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation("auth");
  const isArabic = isArabicLocale(i18n.language);
  
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (authInitializing || !userSynced) return;

    if (!user) {
      toastError(t("verify_email.login_required"));
      navigate("/login", { state: { returnUrl: safeReturnUrl(location.pathname + location.search) } });
      return;
    }

    if (verificationAttempted.current) return;

    if (user.is_verified === true || user.is_verified === "true" || user.is_verified === 1) {
      setStatus("success");
      return;
    }

    const performVerification = async () => {
      verificationAttempted.current = true;
      try {
        await verifyEmail(id, hash, expires, signature);
        
        updateUser({ ...user, is_verified: true });
        
        setStatus("success");
        toastSuccess(t("verify_email.success_toast"));
        
        setTimeout(() => {
          navigate("/student/dashboard");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setErrorMessage(
          error.response?.data?.message || t("verify_email.failed_default"),
        );
      }
    };

    if (id && hash && expires && signature) {
      performVerification();
    } else {
      setStatus("error");
      setErrorMessage(t("verify_email.invalid_link"));
    }
  }, [user, authInitializing, userSynced, id, hash, expires, signature, navigate, location, t, updateUser]);

  const handleResend = async () => {
    try {
      setIsResending(true);
      await resendVerificationNotification();
      toastSuccess(t("verify_email.resend_success"));
    } catch (error) {
      toastError(
        error.response?.data?.message || t("verify_email.resend_error"),
      );
    } finally {
      setIsResending(false);
    }
  };

  if (authInitializing || !userSynced) {
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
            <Link to="/">
              <img
                src={tsquareLogo}
                alt="T-Square Logo"
                className="login-logo mb-4"
                title={t("back_to_home")}
              />
            </Link>

            {status === "loading" && (
              <div className="py-4">
                <Spinner animation="border" variant="danger" className="mb-3" style={{ width: "3rem", height: "3rem" }} />
                <h4 className="fw-bold text-dark">{t("verify_email.loading_title")}</h4>
                <p className="text-muted">{t("verify_email.loading_message")}</p>
              </div>
            )}

            {status === "success" && (
              <div className="py-4">
                <i className="bi bi-check-circle-fill text-success mb-3 d-block" style={{ fontSize: "4rem" }}></i>
                <h4 className="fw-bold text-dark">{t("verify_email.success_title")}</h4>
                <p className="text-muted mb-4">{t("verify_email.success_message")}</p>
                <Button 
                  variant="danger" 
                  className="w-100 fw-bold py-2"
                  onClick={() => navigate("/student/dashboard")}
                >
                  {t("verify_email.go_to_dashboard")}
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="py-4">
                <i className="bi bi-x-circle-fill text-danger mb-3 d-block" style={{ fontSize: "4rem" }}></i>
                <h4 className="fw-bold text-dark">{t("verify_email.error_title")}</h4>
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
                      {t("verify_email.sending")}
                    </>
                  ) : (
                    t("verify_email.resend_link")
                  )}
                </Button>
                <Link to="/student/dashboard" className="text-muted text-decoration-none">
                  {t("verify_email.back_to_dashboard")}
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
