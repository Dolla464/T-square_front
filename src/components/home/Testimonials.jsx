import TestimonialsSection from "../shared/TestimonialsSection/TestimonialsSection";

function Testimonials({ items, waitForHomeData = false }) {
  return (
    <TestimonialsSection items={items} waitForHomeData={waitForHomeData} />
  );
}

export default Testimonials;
