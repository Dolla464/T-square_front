import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useTestimonials } from "../../../hooks/useTestimonials";
import studentImg from "../../../assets/student-avatar.jpg";
import "./TestimonialsSection.css";

/**
 * مكون التقييمات المشترك — TestimonialsSection
 * يُستخدم في صفحات: Contact, Team, Solutions, Home
 * يقبل بيانات خارجية (prop) أو يجلبها من الهوك تلقائياً
 *
 * @param {Array}  [data]  - بيانات التقييمات (اختياري — لو مش موجود يجلبها من الهوك)
 * @param {string} [className] - كلاس إضافي للتنسيق
 */
function TestimonialsSection({ data, className = "" }) {
  const { t } = useTranslation("testimonials");

  // لو فيه داتا ممررة من البرا نستخدمها، ولو لأ نجلب من الهوك
  const { testimonials: hookData, loading, error } = useTestimonials();
  const testimonials = data || hookData;

  return (
    <div className={`testimonials-section py-5 ${className}`}>
      <Container className="py-5">
        {/* عنوان القسم */}
        <h2 className="text-center fw-bold mb-5">
          {t("title")}
        </h2>

        {/* حالة التحميل */}
        {!data && loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* حالة الخطأ */}
        {!data && error && (
          <div className="text-center py-5 text-danger">
            <p>{t("errorLoading") || "Failed to load testimonials."}</p>
          </div>
        )}

        {/* عرض الكاردات */}
        {(!loading || data) && (
          <Row className="g-4">
            {testimonials.map((testimonial) => (
              <Col lg={4} md={6} key={testimonial.id}>
                <div className="testimonial-card">
                  {/* أيقونة الاقتباس */}
                  <div className="quote-icon mb-3">
                    <span className="quote-mark">&ldquo;</span>
                  </div>

                  {/* معلومات الشخص */}
                  <div className="d-flex align-items-center mb-4">
                    <img
                      src={testimonial.image || studentImg}
                      alt={testimonial.name}
                      className="testimonial-avatar"
                      style={{ marginInlineEnd: "12px" }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">{testimonial.name}</h6>
                      <small className="text-muted">{testimonial.role}</small>
                      {/* النجوم */}
                      <div className="mt-1 d-flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`bi bi-star-fill ${i < testimonial.stars ? "text-warning" : "text-light-gray"}`}
                            style={{ fontSize: "14px" }}
                          ></i>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* نص التقييم */}
                  <p className="text-muted testimonial-text">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default TestimonialsSection;
