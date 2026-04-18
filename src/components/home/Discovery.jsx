import { Button, Container } from "react-bootstrap";
import "./Discovery.css";
import { useTranslation } from "react-i18next";
// استورد الـ 5 صور الحقيقية هنا
import img1 from "../../assets/discovery/1.png";
import img2 from "../../assets/discovery/2.png";
import img3 from "../../assets/discovery/3.png";
import img4 from "../../assets/discovery/4.png"; // صورة إضافية
import img5 from "../../assets/discovery/5.png"; // صورة إضافية
import wavesBg from "../../assets/discovery/waves.png";
import { Link } from "react-router-dom";

function Discovery() {
  const { t } = useTranslation("discovery");
  return (
    <section className="discovery-section">
      {/* Waves Background */}
      <img src={wavesBg} className="discovery-waves" alt={t("alt.waves")} />

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
          <span className="floating-badge badge-ux">{t("badges.ux")}</span>
          <span className="floating-badge badge-data">{t("badges.data")}</span>
          <span className="floating-badge badge-front">
            {t("badges.front")}
          </span>
        </div>

        {/* Content */}
        <h2 className="discovery-title">{t("title")}</h2>
        <p className="discovery-text">
          {t("subtitle_line1")}
          <br />
          {t("subtitle_line2")}
        </p>

        <Button as={Link} to="/courses" className="explore-btn">
          {t("cta.button")}
        </Button>
      </Container>
    </section>
  );
}

export default Discovery;
