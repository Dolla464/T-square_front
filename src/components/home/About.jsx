import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./About.css";
import about1 from "../../assets/about1.png";
import about2 from "../../assets/about2.png";
import about3 from "../../assets/about3.png";

function About() {
  const { t, i18n } = useTranslation("home");
  const isAr = i18n.language === "ar";

  return (
    <section className="about-section">
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
            className={`about-text-content mb-5 mb-lg-0 ${isAr ? "text-start" : "text-end"}`}
          >
            <span className="about-badge mb-3 d-inline-block">
              {t("About_T-Square")}
            </span>
            <h2 className="about-title fw-bold mb-4">
              {t("We_Don't_Just_Teach_Code")}
              <br />
              <span style={{ color: "#be1522" }}>{t("We_Build_Careers")}</span>
            </h2>

            <p className="about-text mb-4 fs-5">{t("tsquare_info")}</p>
            <p className="about-text mb-5 fs-5">{t("tsquare_info2")}</p>
          </Col>
          {/* الجانب الأيسر (النصوص): هيظهر فوق في الموبايل */}
          <Col lg={6}>
            <div className="about-img-container">
              <img
                src={about1}
                alt="class"
                className="about-img img-side left"
              />
              <img
                src={about2}
                alt="students"
                className="about-img img-center"
              />
              <img
                src={about3}
                alt="mentor"
                className="about-img img-side right"
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
