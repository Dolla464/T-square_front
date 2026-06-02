import { Container, Button, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero({ heroImage, heroSettings }) {
  const { t, i18n } = useTranslation(["home", "common"]);
  const isAr = i18n.language === "ar";
  const isArabic = isAr;

  // دالة مساعدة لتصفية قيم N/A والرجوع للترجمة الافتراضية
  const getHeroText = (value, fallbackKey) => {
    if (!value || value === "N/A" || value.trim() === "") {
      return t(fallbackKey);
    }
    return value;
  };

  // 2. تريكة الـ Fallback الذكية: لو الـ API رجع صورة نستخدمها، وإلا نرجع للصورة اللوكال
  const currentBg = heroImage || "";

  // الـ Style الديناميكي صار يقرأ من المتغير الذكي currentBg
  const dynamicStyle = {
    backgroundImage: `
  linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.82) 40%,
    rgba(0, 0, 0, 0.42) 100%
  ),
  url("${currentBg}")
`,
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
              {isArabic ? getHeroText(heroSettings?.hero_title_ar, "") : getHeroText(heroSettings?.hero_title_en, "")}
              <span className="hero-highlight-wrapper">
                <span className="highlight-text">
                  {isArabic ? getHeroText(heroSettings?.hero_title_highlight_ar, "") : getHeroText(heroSettings?.hero_title_highlight_en, "")}
                </span>
                {/* الـ Vector ده لوحده هيرسم الدايرتين */}
                <div className="hero-vector"></div>
              </span>
            </h1>

            <p className="lead mb-5 hero-subtitle fw-normal">
              {isArabic ? getHeroText(heroSettings?.hero_subtitle_ar, "") : getHeroText(heroSettings?.hero_subtitle_en, "")}
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
