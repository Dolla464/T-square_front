import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp";
import "../Login/Login.css";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation("common");
  const isArabic = i18n.language === "ar";

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="login-wrapper notfound-wrapper" dir={isArabic ? "rtl" : "ltr"}>
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Card className="login-card notfound-card shadow border-0 p-4">
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

            <div className="py-4">
              <div className="error-code-container mb-3">
                <span className="error-code">404</span>
              </div>
              
              <h4 className="fw-bold text-dark mb-2">
                {isArabic ? "الصفحة غير موجودة!" : "Page Not Found!"}
              </h4>
              
              <p className="text-muted mb-4">
                {isArabic 
                  ? "عذراً، الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله." 
                  : "Sorry, the page you are looking for does not exist or has been moved."}
              </p>

              <div className="d-flex flex-column gap-2">
                <Button 
                  variant="danger" 
                  className="w-100 fw-bold py-2 login-btn"
                  onClick={() => navigate(user ? (user.role === "admin" ? "/admin" : "/student/dashboard") : "/")}
                >
                  {user 
                    ? (isArabic ? "الذهاب للوحة التحكم" : "Go to Dashboard")
                    : (isArabic ? "العودة للرئيسية" : "Go to Home Page")}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  className="w-100 fw-bold py-2 btn-back"
                  onClick={handleGoBack}
                >
                  {isArabic ? "العودة للصفحة السابقة" : "Go Back"}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default NotFoundPage;
