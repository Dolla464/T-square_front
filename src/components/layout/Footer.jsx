import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./Footer.css";
import logoWhite from "../../assets/logo-white.png"; // اللوجو باللون الأبيض

function Footer() {
  const { t } = useTranslation("footer");

  return (
    <footer className="main-footer">
      <Container>
        <Row className="gy-4">
          {/* عمود اللوجو والوصف */}
          <Col lg={5} md={12}>
            <img src={logoWhite} alt="T-Square Logo" className="footer-logo" />
            <p className="footer-desc">{t("description")}</p>
          </Col>

          {/* عمود Academy */}
          <Col lg={3} md={6}>
            <h5 className="footer-heading">{t("sections.academy")}</h5>
            <ul className="footer-links">
              <li>
                <Link to="/courses">{t("links.allCourses")}</Link>
              </li>
              <li>
                <Link to="/courses">{t("links.kidsPrograms")}</Link>
              </li>
              <li>
                <Link to="/courses">{t("links.ourTeam")}</Link>
              </li>
            </ul>
          </Col>

          {/* عمود Services */}
          <Col lg={4} md={6}>
            <h5 className="footer-heading">{t("sections.services")}</h5>
            <ul className="footer-links">
              <li>
                <Link to="/solutions">{t("links.webDevelopment")}</Link>
              </li>
              <li>
                <Link to="/solutions">{t("links.mobileApps")}</Link>
              </li>
              <li>
                <Link to="/solutions">{t("links.aiSolutions")}</Link>
              </li>
              <li>
                <Link to="/solutions">{t("links.uiUxDesign")}</Link>
              </li>
              <li>
                <Link to="/solutions">{t("links.supermarkets")}</Link>
              </li>
            </ul>
          </Col>
        </Row>

        {/* حقوق النشر */}
        <div className="footer-bottom">
          <p>{t("copyright")}</p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
