import { Container, Row, Col } from "react-bootstrap";
import "./Features.css";
import starIconImg from "../../assets/featureIcon.png";
import logoFull from "../../assets/logo-dark.png"; // اللوجو الكبير اللي في النص

const featuresData = [
  {
    title: "Online & Offline Flexibility",
    desc: "Choose in-person, remote, or hybrid learning based on your schedule.",
    icon: starIconImg,
  },
  {
    title: "Industry-Experienced Instructors",
    desc: "Learn from professionals actively working in top tech companies.",
    icon: starIconImg,
  },
  {
    title: "Accredited Certificates",
    desc: "Earn recognized certificates that boost your resume and credibility.",
    icon: starIconImg,
  },
  {
    title: "Real-World Projects",
    desc: "Build actual products, not toy examples. Graduate with a strong portfolio.",
    icon: starIconImg,
  },
  {
    title: "Strong Tech Community",
    desc: "Access alumni network, events, hackathons, and ongoing mentorship.",
    icon: starIconImg,
  },
  {
    title: "Career Support",
    desc: "Resume reviews, mock interviews, and direct connections to hiring partners.",
    icon: starIconImg,
  },
];

function Features() {
//   const { t } = useTranslation();

  return (
    <section className="features-section">
      {/* دوائر الخلفية */}

      <Container>
        <div className="text-center mb-5">
          <span className="about-badge mb-3 d-inline-block">Why T-Square</span>
          <h2 className="fw-bold">Everything You Need to Succeed</h2>
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
          >
            {featuresData.slice(0, 3).map((f, i) => (
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
          >
            {featuresData.slice(3, 6).map((f, i) => (
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
