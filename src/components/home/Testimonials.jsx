import { Container, Row, Col } from "react-bootstrap";
import "./Testimonials.css";
import { MOCK_DATA } from "../../data/mockData";
import studentImg from "../../assets/student-avatar.jpg";

function Testimonials() {
  // جلب المراجعات والطلاب من الموك داتا
  const reviews = MOCK_DATA.course_reviews;
  const students = MOCK_DATA.students;

  return (
    <section className="testimonials-section">
      <Container>
        <h2 className="fw-bold mb-5 text-center">What Our students Say !</h2>

        <Row className="g-4">
          {reviews.map((review) => {
            // البحث عن بيانات الطالب صاحب هذا التقييم
            const student = students.find((s) => s.id === review.student_id);

            return (
              <Col lg={4} md={6} key={review.id}>
                <div className="testimonial-card">
                  <span className="quote-icon">“</span>

                  <div className="student-info">
                    <img
                      src={studentImg} // يمكنك استبدالها بصورة الطالب من الموك داتا لو متوفرة
                      alt={student?.full_name}
                      className="student-img"
                    />
                    <div className="student-details">
                      <h5>{student?.full_name || "Unknown Student"}</h5>
                      {/* عرض رقم المجموعة كـ Role مؤقتاً أو وظيفة الطالب */}
                      <span>Group: {student?.enrollment_number}</span>
                    </div>
                  </div>

                  <div className="stars-container">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`bi bi-star-fill ${
                          i >= review.rating ? "star-empty" : ""
                        } me-1`}
                      ></i>
                    ))}
                  </div>

                  <p className="testimonial-text">"{review.overall_comment}"</p>
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
}

export default Testimonials;
