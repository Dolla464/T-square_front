import { Button, Container } from "react-bootstrap";
import "./Discovery.css";
// استورد الـ 5 صور الحقيقية هنا
import img1 from "../../assets/discovery/1.png";
import img2 from "../../assets/discovery/2.png";
import img3 from "../../assets/discovery/3.png";
import img4 from "../../assets/discovery/4.png"; // صورة إضافية
import img5 from "../../assets/discovery/5.png"; // صورة إضافية
import wavesBg from "../../assets/discovery/waves.png";
import { Link } from "react-router-dom";

function Discovery() {
  return (
    <section className="discovery-section">
      {/* Waves Background */}
      <img src={wavesBg} className="discovery-waves" alt="background waves" />

      <Container className="discovery-container">
        {/* الصور في شكل قوس أوسع (5 صور) */}
        <div className="position-relative">
          <div className="images-arc">
            {/* أقصى اليسار */}
            <img
              src={img1}
              className="arc-img img-outer-left"
              alt="learning 1"
            />
            {/* اليسار الداخلي */}
            <img src={img2} className="arc-img img-inner-left" alt="coding 2" />
            {/* المنتصف - الأعلى */}
            <img src={img3} className="arc-img img-center" alt="classroom 3" />
            {/* اليمين الداخلي */}
            <img
              src={img4}
              className="arc-img img-inner-right"
              alt="collaboration 4"
            />
            {/* أقصى اليمين */}
            <img
              src={img5}
              className="arc-img img-outer-right"
              alt="student 5"
            />
          </div>

          {/* Floating Badges */}
          <span className="floating-badge badge-ux">UX/UI Design</span>
          <span className="floating-badge badge-data">Data Analysis</span>
          <span className="floating-badge badge-front">Frontend</span>
        </div>

        {/* Content */}
        <h2 className="discovery-title">Discover Your Ideal Career</h2>
        <p className="discovery-text">
          Answer 5 quick questions and we'll recommend the perfect learning path
          <br />
          for you.
        </p>

        <Button as={Link} to="/courses" className="explore-btn">
          Explore Courses
        </Button>
      </Container>
    </section>
  );
}

export default Discovery;
