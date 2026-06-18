import { t } from "i18next";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import i18n from "../../../i18n.js";
function CtaEnroll() {
  const { user } = useAuth();
  const isArabic = i18n.language == "ar";
  return (
    <div className="cta-journey-section text-center text-white py-5 mt-5">
      <Container className="py-5 position-relative z-1">
        <h2 className="cta-title fw-bold mb-3">{t("cta:title")}</h2>
        <p className="cta-desc mb-5 mx-auto">{t("cta:desc")}</p>
        {user ? (
          <Link
            to={`/${user.role}`}
            className="btn-cta-enroll text-decoration-none"
          >
            {isArabic ? "اذهب إلى لوحة التحكم" : "Go to Dashboard"}
          </Link>
        ) : (
          <Link to="/signup" className="btn-cta-enroll text-decoration-none">
            {isArabic ? "ابدأ رحلتك" : "Start Your Journey"}
          </Link>
        )}
      </Container>
    </div>
  );
}

export default CtaEnroll;
