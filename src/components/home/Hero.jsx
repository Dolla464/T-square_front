import { Container, Button, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import heroImg from "../../assets/hero-bg-min.webp";
import "./Hero.css"; // استيراد ملف الـ CSS

function Hero() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  // الـ Style الوحيد اللي هيفضل هنا هو الخلفية عشان المتغير heroImg
  const dynamicStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3)), url("${heroImg}")`,
  };

  return (
    <section className="hero-section" style={dynamicStyle}>
      <Container>
        <Row>
          <Col md={7} className={isAr ? "text-start" : "text-end"}>
          
            <h1 className="display-3 fw-bold mb-3 hero-title">
              {t("hero_title_start")}{" "}
              <span className="hero-highlight-wrapper">
                <span className="highlight-text">
                  {t("hero_title_highlight")}
                </span>
                {/* الـ Vector ده لوحده هيرسم الدايرتين */}
                <div className="hero-vector"></div>
              </span>
            </h1>

            <p className="lead mb-5 hero-subtitle fw-normal">
              {t("hero_subtitle")}
            </p>

            <div className="d-flex gap-3 justify-content-start">
              <Button
                variant="danger"
                as={Link}
                to="/contact"
                className="px-5 py-2 fw-bold btn-hero-primary"
              >
                {t("contact_us")}
              </Button>
              <Button
                variant="outline-light"
                as={Link}
                to="/courses"
                className="px-5 py-2 fw-bold btn-hero-outline"
              >
                {t("explore_courses")}
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Hero;
