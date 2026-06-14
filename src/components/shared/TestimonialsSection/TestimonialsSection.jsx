import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTestimonials } from "../../../hooks/useTestimonials";
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
  const containerRef = useRef(null);

  // لو فيه داتا ممررة من البرا نستخدمها، ولو لأ نجلب من الهوك
  const { testimonials, loading, error } = useTestimonials();

  const handleScroll = (direction) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const card = container.querySelector(".testimonial-card-horizontal");
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const gap = 20; // الفجوة بين الكروت

    // تحديد عدد الكروت المنقولة حسب حجم الشاشة لضمان التوافقية
    let step = 3;
    if (window.innerWidth < 768) {
      step = 1;
    } else if (window.innerWidth < 1200) {
      step = 2;
    }

    const scrollAmount = (cardWidth + gap) * step;
    const isRTL = document.documentElement.dir === "rtl" || window.getComputedStyle(container).direction === "rtl";

    // حساب اتجاه السكرول مع مراعاة اللغة العربية والانجليزية
    let scrollDirection = direction === "next" ? 1 : -1;
    if (isRTL) {
      scrollDirection = -scrollDirection;
    }

    container.scrollBy({
      left: scrollAmount * scrollDirection,
      behavior: "smooth",
    });
  };

  return (
    <div className={`testimonials-section py-5 ${className}`}>
      <div className="py-5 px-md-5">
        {/* عنوان القسم */}
        <h2 className="text-center fw-bold mb-5">{t("title")}</h2>

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
          <>
            <div 
              className="testimonials-scroll-container px-md-3"
              ref={containerRef}
            >
              <div className="testimonials-scroll-wrapper ">
                {testimonials?.map((testimonial) => (
                  <div
                    className="testimonial-card-horizontal"
                    key={testimonial.id}
                  >
                    {/* أيقونة الاقتباس */}
                    <div className="quote-icon-horizontal">
                      <span className="quote-mark">&ldquo;</span>
                    </div>

                    {/* معلومات الشخص */}
                    <div className="d-flex align-items-center  mb-3 gap-3">

                      {false ? (
                        <img className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold overflow-hidden "
                          src={testimonial?.student?.avatar}
                          alt={testimonial?.student?.full_name}
                          style={{ width: "55px", height: "55px" }}
                        />
                      ) : (
                        <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold overflow-hidden "
                          style={{ width: "55px", height: "55px" }}>
                          {testimonial?.student?.full_name ? testimonial?.student?.full_name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}

                      <div>
                        <h6 className="mb-0 fw-bold">
                          {testimonial.student?.full_name}
                        </h6>
                        <small className="text-muted">
                          {testimonial.course?.title ||
                            testimonial.instructor?.full_name}
                        </small>
                        {/* النجوم */}
                        <div className="mt-1 d-flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`bi bi-star-fill ${i < Math.round(testimonial.rating) ? "text-warning" : "text-light-gray"}`}
                              style={{ fontSize: "14px" }}
                            ></i>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* نص التقييم */}
                    <p className="text-muted text-start fw-bolder">
                      {testimonial.overall_comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* أزرار التنقل */}
            <div className="testimonials-navigation d-flex justify-content-center align-items-center gap-3 mt-4">
              <button 
                onClick={() => handleScroll("prev")} 
                className="testimonial-nav-btn prev-btn d-flex align-items-center justify-content-center"
                aria-label="Previous testimonials"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button 
                onClick={() => handleScroll("next")} 
                className="testimonial-nav-btn next-btn d-flex align-items-center justify-content-center"
                aria-label="Next testimonials"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TestimonialsSection;
