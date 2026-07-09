import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTestimonials } from "../../../hooks/useTestimonials";
import "./TestimonialsSection.css";

function TestimonialCarousel({ items, containerRef, onScroll, prevLabel, nextLabel }) {
  const reviewList = Array.isArray(items) ? items : [];

  if (!reviewList.length) {
    return null;
  }

  return (
    <>
      <div className="testimonials-scroll-container px-md-3" ref={containerRef}>
        <div className="testimonials-scroll-wrapper">
          {reviewList.map((testimonial) => (
            <div className="testimonial-card-horizontal" key={testimonial.id}>
              <div className="quote-icon-horizontal">
                <span className="quote-mark">&ldquo;</span>
              </div>

              <div className="d-flex align-items-center mb-3 gap-3">
                <div
                  className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold overflow-hidden"
                  style={{ width: "55px", height: "55px" }}
                >
                  {testimonial?.student?.full_name
                    ? testimonial.student.full_name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div>
                  <h6 className="mb-0 fw-bold">{testimonial.student?.full_name}</h6>
                  <small className="text-muted">
                    {testimonial.course?.title || testimonial.instructor?.full_name}
                  </small>
                  <div className="mt-1 d-flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`bi bi-star-fill ${i < Math.round(testimonial.rating) ? "text-warning" : "text-light-gray"}`}
                        style={{ fontSize: "14px" }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-muted text-start fw-bolder testimonial-text-horizontal">
                {testimonial.overall_comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="testimonials-navigation d-flex justify-content-center align-items-center gap-3 mt-4">
        <button
          onClick={() => onScroll("prev")}
          className="testimonial-nav-btn prev-btn d-flex align-items-center justify-content-center"
          aria-label={prevLabel}
          type="button"
        >
          <i className="bi bi-chevron-left" />
        </button>
        <button
          onClick={() => onScroll("next")}
          className="testimonial-nav-btn next-btn d-flex align-items-center justify-content-center"
          aria-label={nextLabel}
          type="button"
        >
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </>
  );
}

/**
 * مكون التقييمات المشترك — TestimonialsSection
 */
function TestimonialsSection({ className = "", items = null }) {
  const { t } = useTranslation("testimonials");
  const carouselRef = useRef(null);
  const useProvidedItems = items !== null;
  const hookResult = useTestimonials({ enabled: !useProvidedItems });
  const { testimonials: hookTestimonials, loading: hookLoading, error: hookError } = hookResult;

  const testimonials = useProvidedItems ? items : hookTestimonials;
  const loading = useProvidedItems ? false : hookLoading;
  const error = useProvidedItems ? null : hookError;

  const handleScroll = (containerRef, direction) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const card = container.querySelector(".testimonial-card-horizontal");
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const gap = 20;

    let step = 3;
    if (window.innerWidth < 768) {
      step = 1;
    } else if (window.innerWidth < 1200) {
      step = 2;
    }

    const scrollAmount = (cardWidth + gap) * step;
    const isRTL =
      document.documentElement.dir === "rtl" ||
      window.getComputedStyle(container).direction === "rtl";

    let scrollDirection = direction === "next" ? 1 : -1;
    if (isRTL) {
      scrollDirection = -scrollDirection;
    }

    container.scrollBy({
      left: scrollAmount * scrollDirection,
      behavior: "smooth",
    });
  };

  const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];
  const hasAnyReviews = safeTestimonials.length > 0;

  return (
    <div className={`testimonials-section py-5 ${className}`}>
      <div className="py-5 px-md-5">
        <h2 className="text-center fw-bold mb-3">{t("title")}</h2>
        <p className="text-center text-muted mb-5">{t("subtitle")}</p>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-5 text-danger">
            <p>{t("errorLoading") || "Failed to load testimonials."}</p>
          </div>
        )}

        {!loading && !error && !hasAnyReviews && (
          <div className="text-center py-5 text-muted">
            <p>{t("empty") || "No reviews yet."}</p>
          </div>
        )}

        {!loading && !error && hasAnyReviews && (
          <TestimonialCarousel
            items={safeTestimonials}
            containerRef={carouselRef}
            onScroll={(direction) => handleScroll(carouselRef, direction)}
            prevLabel={t("prev_label")}
            nextLabel={t("next_label")}
          />
        )}
      </div>
    </div>
  );
}

export default TestimonialsSection;
