import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDiscoveryMedia } from "../../hooks/useDiscovery";
import "./Discovery.css";

// الصور الافتراضية (Fallback)
import img1 from "../../assets/discovery/1.webp";
import img2 from "../../assets/discovery/2.webp";
import img3 from "../../assets/discovery/3.webp";
import img4 from "../../assets/discovery/4.webp";
import img5 from "../../assets/discovery/5.webp";
import wavesBg from "../../assets/discovery/waves.webp";

function Discovery() {
  const { t } = useTranslation("discovery");

  const { discoveryMedia, loading } = useDiscoveryMedia();

  const initialImages =
    !loading && discoveryMedia && discoveryMedia.length >= 5
      ? discoveryMedia.slice(0, 5)
      : [img1, img2, img3, img4, img5];

  const [currentFive, setCurrentFive] = useState(initialImages);

  useEffect(() => {
    if (!loading && discoveryMedia && discoveryMedia.length >= 5) {
      setCurrentFive(discoveryMedia.slice(0, 5));
    }
  }, [discoveryMedia, loading]);

  useEffect(() => {
    if (!discoveryMedia || discoveryMedia.length <= 5) return;

    const interval = setInterval(() => {
      setCurrentFive((prevFive) => {
        const availableImages = discoveryMedia.filter(
          (img) => !prevFive.includes(img),
        );
        if (availableImages.length === 0) return prevFive;

        const randomNewImage =
          availableImages[Math.floor(Math.random() * availableImages.length)];
        const randomIndexToReplace = Math.floor(Math.random() * 5);

        const updatedFive = [...prevFive];
        updatedFive[randomIndexToReplace] = randomNewImage;

        return updatedFive;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [discoveryMedia]);

  return (
    <section className="discovery-section py-md-5 py-5">
      {/* Waves Background */}
      <img src={wavesBg} className="discovery-waves" alt={t("alt.waves")} />

      <Container className="discovery-container pt-1">
        <div className="position-relative">
          <div className="images-arc" dir="ltr">
            {/* أقصى اليسار */}
            <img
              src={currentFive[0]}
              className="arc-img img-outer-left"
              alt="learning 1"
              width="250"
              height="160"
              loading="lazy"
            />
            {/* اليسار الداخلي */}
            <img
              src={currentFive[1]}
              className="arc-img img-inner-left"
              alt="coding 2"
              width="250"
              height="160"
              loading="lazy"
            />
            {/* المنتصف - الأعلى */}
            <img
              src={currentFive[2]}
              className="arc-img img-centerX"
              alt="classroom 3"
              width="250"
              height="160"
              loading="lazy"
            />
            {/* اليمين الداخلي */}
            <img
              src={currentFive[3]}
              className="arc-img img-inner-right"
              alt="collaboration 4"
              width="250"
              height="160"
              loading="lazy"
            />
            {/* أقصى اليمين */}
            <img
              src={currentFive[4]}
              className="arc-img img-outer-right"
              alt="student 5"
              width="250"
              height="160"
              loading="lazy"
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
