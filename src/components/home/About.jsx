import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useHeroAndAboutData } from "../../hooks/useDiscovery"; // تأكد من مسار الـ Hook الموحد عندك
import "./About.css";

// الصور الافتراضية (Fallback)
import about1 from "../../assets/about1.png";
import about2 from "../../assets/about2.png";
import about3 from "../../assets/about3.png";

function About() {
  const { t, i18n } = useTranslation("home");
  const isAr = i18n.language === "ar";

  // 1. استدعاء بيانات الـ About من الـ Hook الموحد
  const { aboutImages } = useHeroAndAboutData();

  // 2. التحقق من الصور: لو الأدمن رفع الـ 3 صور كاملين نقرأ منهم ديناميكياً، وإلا نثبت الـ Fallback
  const hasUploadedImages = aboutImages && aboutImages.length >= 3;

  const currentImg1 = hasUploadedImages ? aboutImages[0] : about1;
  const currentImg2 = hasUploadedImages ? aboutImages[1] : about2;
  const currentImg3 = hasUploadedImages ? aboutImages[2] : about3;

  return (
    <section className="about-section py-md-5 my-3 py-2">
      <Container>
        {/* التعديل هنا: flex-column-reverse بيخلي النص يسبق الصور في الموبايل */}
        <Row
          className={`about-row-custom align-items-center flex-column-reverse flex-lg-row ${
            isAr ? "flex-lg-row-reverse" : ""
          }`}
        >
          {/* الجانب الأيمن (الصور): هيظهر تحت في الموبايل */}
          <Col
            lg={6}
            className={`about-text-content mb-0 ${isAr ? "text-start" : "text-end"}`}
          >
            <div className="d-md-block d-none">
              <span className="about-badge mb-3 d-inline-block">
                {t("About_T-Square")}
              </span>
              <h2 className="about-title fw-bold mb-4">
                {t("We_Don't_Just_Teach_Code")}
                <br />
                <span style={{ color: "#be1522" }}>
                  {t("We_Build_Careers")}
                </span>
              </h2>
            </div>

            <p className="about-text mb-4 fs-5">{t("tsquare_info")}</p>
            <p className="about-text mb-5 fs-5">{t("tsquare_info2")}</p>
          </Col>

          <div className="d-md-none d-block text-center mt-5">
            <span className="about-badge mb-1 d-inline-block">
              {t("About_T-Square")}
            </span>
            <h2 className="about-title fw-bold mb-4">
              {t("We_Don't_Just_Teach_Code")}
              <br />
              <span style={{ color: "#be1522" }}>{t("We_Build_Careers")}</span>
            </h2>
          </div>

          {/* الجانب الأيسر (النصوص): هيظهر فوق في الموبايل */}
          <Col lg={6}>
            <div className="about-img-container">
              <img
                src={currentImg1} // ديناميكي
                alt="class"
                className="about-img img-side left"
                loading="lazy"
              />
              <img
                src={currentImg2} // ديناميكي
                alt="students"
                className="about-img img-center"
                loading="lazy"
              />
              <img
                src={currentImg3} // ديناميكي
                alt="mentor"
                className="about-img img-side right"
                loading="lazy"
              />
            </div>

            <div className="slider-dots">
              <span className="dot"></span>
              <span className="dot active"></span>
              <span className="dot"></span>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default About;
