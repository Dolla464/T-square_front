import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import "./Footer.css";
import logoWhite from "../../assets/logo-white.png"; // اللوجو باللون الأبيض

function Footer() {
  return (
    <footer className="main-footer">
      <Container>
        <Row className="gy-4">
          {/* عمود اللوجو والوصف */}
          <Col lg={5} md={12}>
            <img src={logoWhite} alt="T-Square Logo" className="footer-logo" />
            <p className="footer-desc">
              Empowering the next generation of tech professionals through
              hands-on learning, real-world projects, and career-focused
              mentorship.
            </p>
          </Col>

          {/* عمود Academy */}
          <Col lg={3} md={6}>
            <h5 className="footer-heading">Academy</h5>
            <ul className="footer-links">
              <li>
                <Link to="/courses">
                  All Courses
                </Link>
              </li>
              <li>
                <a href="#kids">Kids Programs</a>
              </li>
              <li>
                <a href="#team">Our team</a>
              </li>
            </ul>
          </Col>

          {/* عمود Services */}
          <Col lg={4} md={6}>
            <h5 className="footer-heading">Services</h5>
            <ul className="footer-links">
              <li>
                <a href="#web">Web Development</a>
              </li>
              <li>
                <a href="#mobile">Mobile Apps</a>
              </li>
              <li>
                <a href="#ai">AI Solutions</a>
              </li>
              <li>
                <a href="#uiux">UI/UX Design</a>
              </li>
              <li>
                <a href="#super">Supermarkets</a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* حقوق النشر */}
        <div className="footer-bottom">
          <p>© 2026 T-Square , All Rights Reserved</p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
