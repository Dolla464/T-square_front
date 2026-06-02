import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import tsquareLogo from "../../assets/logo-dark.webp";
import "../Login/Login.css";
import "../NotFound/NotFoundPage.css";
import "./MaintenancePage.css";

const MaintenancePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation("common");
  const isArabic = i18n.language === "ar";

  return (
    <div className="login-wrapper notfound-wrapper maintenance-wrapper" dir={isArabic ? "rtl" : "ltr"}>
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Card className="login-card notfound-card maintenance-card shadow border-0 p-4">
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
              <div className="maintenance-icon-container mb-4">
                <div className="gear-wrapper">
                  <i className="bi bi-gear-fill gear-main"></i>
                  <i className="bi bi-gear-fill gear-sub"></i>
                </div>
              </div>
              
              <h4 className="fw-bold text-dark mb-3">
                {isArabic ? "الموقع قيد الصيانة المؤقتة!" : "Site Under Maintenance!"}
              </h4>
              
              <p className="text-muted mb-4 px-3" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                {isArabic 
                  ? "نعمل حالياً على تحسين وتحديث المنصة لتقديم أفضل تجربة تعليمية ممكنة. سنعود إليكم قريباً جداً!" 
                  : "We are currently upgrading and optimizing our platform to bring you the best possible educational experience. We will be back online shortly!"}
              </p>

              <div className="d-flex flex-column gap-2 mt-4">
                {/* إذا كان أدمن ولكنه على صفحة الصيانة، أو ليس مسجل دخول ويريد تجربة الدخول */}
                <Button 
                  variant="danger" 
                  className="w-100 fw-bold py-2 login-btn"
                  onClick={() => navigate("/login")}
                >
                  {isArabic ? "دخول الإدارة (أدمن)" : "Admin Control Panel Access"}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  className="w-100 fw-bold py-2 btn-back"
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  {isArabic ? "تحديث الصفحة" : "Refresh Page"}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default MaintenancePage;
