import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./ContactSection.css";
import classroomImg from "../../../assets/contact.png";

function ContactSection() {
  return (
    <section className="contact-section py-5">
      <Container>
        <Row className="align-items-center g-0">
          {/* الجانب الأيسر: الصورة المقصوصة */}
          <Col lg={6} className="position-relative d-none d-lg-block">
            <div className="custom-image-container">
              {/* الطبقة الحمراء اللي ورا */}
              <div className="red-bg-shape"></div>
              {/* الصورة نفسها */}
              <div className="image-clipper">
                <img
                  src={classroomImg}
                  alt="Classroom"
                  className="contact-img"
                />
              </div>
            </div>
          </Col>

          {/* الجانب الأيمن: الفورم */}
          <Col lg={6}>
            <div className="contact-card-box">
              <h3 className="fw-bold mb-3">Do you have a question?</h3>
              <p className="text-muted mb-4">
                Our team is ready to answer all your inquiries and provide the
                support you <br />need.
              </p>
              <Form>
                <Form.Control
                  type="text"
                  placeholder="Name*"
                  className="mb-3 custom-input"
                />
                <Form.Control
                  type="email"
                  placeholder="Email Address*"
                  className="mb-3 custom-input"
                />
                <Form.Control
                  type="text"
                  placeholder="Phone Number"
                  className="mb-3 custom-input"
                />
                <Form.Control
                  type="text"
                  placeholder="Learning Track"
                  className="mb-3 custom-input"
                />
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Leave your message here.."
                  className="mb-4 custom-input"
                />
                <Button className="btn-send w-100">Send now</Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default ContactSection;
