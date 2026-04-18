import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./Features.css";
import starIconImg from "../../assets/featureIcon.png";
import logoFull from "../../assets/logo-dark.png";

function Features() {
  const { t } = useTranslation("features");
  const featuresData = t("items", { returnObjects: true });

  // Add icon to each feature
  const featuresWithIcons = featuresData.map((feature) => ({
    ...feature,
    icon: starIconImg,
  }));

  return (
    <section className="features-section">
      {/* دوائر الخلفية */}

      <Container>
        <div className="text-center mb-5">
          <span className="about-badge mb-3 d-inline-block">{t("badge")}</span>
          <h2 className="fw-bold">{t("title")}</h2>
        </div>

        <Row className="align-items-center">
          <div className="features-bg-circles-wrapper">
            <div className="circle-blur circle-1"></div>
            <div className="circle-blur circle-2"></div>
            <div className="circle-blur circle-3"></div>
          </div>
          {/* العمود الأول: 3 كروت شمال */}
          <Col
            lg={5}
            className="d-flex flex-column align-items-end mt-4"
            style={{ gap: "30px" }}
            dir="ltr"
          >
            {featuresWithIcons.slice(0, 3).map((f, i) => (
              <div
                className={`feature-card ${i === 1 ? "ms-5" : ""}`} // الكارت اللي في النص يتشفت يمين (ms-5)
                key={i}
              >
                <div className="feature-icon-wrapper">
                  <img
                    src={f.icon}
                    alt={`${f.title} Icon`}
                    className="feature-icon-img"
                  />
                </div>
                <div>
                  <h5 className="feature-title">{f.title}</h5>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </Col>

          {/* العمود الثاني: اللوجو اللي في النص */}
          <Col lg={2} className="d-none d-lg-block">
            <div className="center-logo-wrapper">
              <img src={logoFull} alt="T-Square Logo" className="center-logo" />
            </div>
          </Col>

          {/* العمود الثالث: 3 كروت يمين */}
          <Col
            lg={5}
            className="d-flex flex-column align-items-start mt-4"
            style={{ gap: "30px" }}
            dir="ltr"
          >
            {featuresWithIcons.slice(3, 6).map((f, i) => (
              <div
                className={`feature-card ${i === 1 ? "me-5" : ""}`} // الكارت اللي في النص يتشفت شمال (me-5)
                key={i}
              >
                <div className="feature-icon-wrapper">
                  <img
                    src={f.icon}
                    alt={`${f.title} Icon`}
                    className="feature-icon-img"
                  />
                </div>
                <div>
                  <h5 className="feature-title">{f.title}</h5>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Features;
