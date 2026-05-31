import { Container, Button, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useHeroAndAboutData } from "../../hooks/useDiscovery"; // استدعاء الـ Hook الموحد
import heroImg from "../../assets/hero-bg-min.webp"; // الصورة الافتراضية اللوكال
import "./Hero.css";

function Hero() {
  const { t, i18n } = useTranslation(["home", "common"]);
  const isAr = i18n.language === "ar";

  // 1. جلب صورة الهيرو المرفوعة من الأدمن عبر الـ Hook
  const { heroImage } = useHeroAndAboutData();

  // 2. تريكة الـ Fallback الذكية: لو الـ API رجع صورة نستخدمها، وإلا نرجع للصورة اللوكال
  const currentBg = heroImage || heroImg;

  // الـ Style الديناميكي صار يقرأ من المتغير الذكي currentBg
  const dynamicStyle = {
    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0)), url("${currentBg}")`,
  };

  return (
    <section
      className={`hero-section ${isAr ? "rtl-bg" : ""}`}
      style={dynamicStyle}
    >
      <Container >
        <Row >
          {/* ملحوظة وتعديل منطقي: لغوياً وعادةً في الـ RTL بنحتاج النص text-end أو text-start على حسب رغبتك في التصميم */}
          <Col md={7} className={isAr ? "text-start" : "text-end"}
          >
            <h1 className="display-3 fw-bold mb-3 hero-title">
              {t("hero_title_start")}
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
                {t("common:contact_us")}
              </Button>
              <Button
                variant="outline-light"
                as={Link}
                to="/courses"
                className="px-5 py-2 fw-bold btn-hero-outline"
              >
                {t("common:explore_courses")}
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section >
  );
}

export default Hero;
