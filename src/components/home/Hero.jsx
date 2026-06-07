import { useState, useEffect } from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./Hero.css";

// ذاكرة تخزين مؤقتة على مستوى الموديول للاحتفاظ بحالة الصور المحملة ومنع الـ Shimmer من العمل عند تكرار الدخول
const loadedImagesCache = new Set();

function Hero({ heroImage, heroSettings }) {
  const { t, i18n } = useTranslation(["home", "common"]);
  const isAr = i18n.language === "ar";
  const isArabic = isAr;

  const [imageLoaded, setImageLoaded] = useState(() =>
    heroImage ? loadedImagesCache.has(heroImage) : false
  );

  // دالة مساعدة لتصفية قيم N/A والرجوع للترجمة الافتراضية
  const getHeroText = (value, fallbackKey) => {
    if (!value || value === "N/A" || value.trim() === "") {
      return t(fallbackKey);
    }
    return value;
  };

  // تحديث حالة الكاش عند تغيير الصورة
  useEffect(() => {
    if (!heroImage) {
      setImageLoaded(false);
      return;
    }
    if (loadedImagesCache.has(heroImage)) {
      setImageLoaded(true);
    }
  }, [heroImage]);

  // عند تحميل الصورة — تحديث الكاش والحالة
  const handleImageLoad = () => {
    if (heroImage) {
      loadedImagesCache.add(heroImage);
    }
    setImageLoaded(true);
  };

  return (
    <section className={`hero-section ${isAr ? "rtl-bg" : ""}`}>
      {/* صورة الخلفية الحقيقية — البراوزر يكتشفها فوراً بدون انتظار JS */}
      {heroImage && (
        <img
          src={heroImage}
          alt=""
          className="hero-bg-image"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          onLoad={handleImageLoad}
        />
      )}

      {/* طبقة التدرج — نفس الـ gradient اللي كان في الـ inline style */}
      <div className="hero-gradient-overlay" />

      {/* وسم التحميل المتدرج المحمر المتحرك */}
      <div
        className="hero-shimmer-overlay"
        style={{
          opacity: imageLoaded && heroImage ? 0 : 1,
          transition: "opacity 0.8s ease-in-out",
        }}
      ></div>

      <Container>
        <Row>
          {/* ملحوظة وتعديل منطقي: لغوياً وعادةً في الـ RTL بنحتاج النص text-end أو text-start على حسب رغبتك في التصميم */}
          <Col md={7} className={isAr ? "text-start" : "text-end"}>
            <h1 className="display-3 fw-bold mb-3 hero-title">
              {isArabic ? getHeroText(heroSettings?.hero_title_ar, "hero_title_start") : getHeroText(heroSettings?.hero_title_en, "hero_title_start")}
              <span className="hero-highlight-wrapper">
                <span className="highlight-text">
                  {isArabic ? getHeroText(heroSettings?.hero_title_highlight_ar, "hero_title_highlight") : getHeroText(heroSettings?.hero_title_highlight_en, "hero_title_highlight")}
                </span>
                {/* الـ Vector ده لوحده هيرسم الدايرتين */}
                <div className="hero-vector"></div>
              </span>
            </h1>

            <p className="lead mb-5 hero-subtitle fw-normal">
              {isArabic ? getHeroText(heroSettings?.hero_subtitle_ar, "hero_subtitle") : getHeroText(heroSettings?.hero_subtitle_en, "hero_subtitle")}
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
    </section>
  );
}

export default Hero;
