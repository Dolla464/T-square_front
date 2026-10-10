import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp";
import "../Login/Login.css";
import "./NotFoundPage.css";
import { isArabicLocale } from "../../utils/isArabicLocale";


const NotFoundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");
  const isArabic = isArabicLocale(i18n.language);

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
            <Link to="/">
              <img
                src={tsquareLogo}
                alt="T-Square Logo"
                className="login-logo mb-4"
                title={t("notFound.back_to_home")}
              />
            </Link>

            <div className="py-4">
              <div className="error-code-container mb-3">
                <span className="error-code">404</span>
              </div>
              
              <h4 className="fw-bold text-dark mb-2">
                {t("notFound.page_title")}
              </h4>
              
              <p className="text-muted mb-4">
                {t("notFound.message")}
              </p>

              <div className="d-flex flex-column gap-2">
                <Button 
                  variant="danger" 
                  className="w-100 fw-bold py-2 login-btn"
                  onClick={() => navigate(user ? (user.role === "admin" ? "/admin" : "/student/dashboard") : "/")}
                >
                  {user ? t("notFound.go_to_dashboard") : t("notFound.go_to_home")}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  className="w-100 fw-bold py-2 btn-back"
                  onClick={handleGoBack}
                >
                  {t("notFound.go_back")}
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
