import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import ContactForm from "../shared/ContactForm/ContactForm";
import "./ContactSection.css";
import classroomImg from "../../assets/contact.png";

function ContactSection() {
  const { t } = useTranslation("contact");

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

          {/* الجانب الأيمن: الفورم المستدعى من المكون المشترك */}
          <Col lg={6}>
            <div className="contact-card-box">
              <ContactForm
                title={t("title")}
                subtitle={t("subtitle")}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default ContactSection;
