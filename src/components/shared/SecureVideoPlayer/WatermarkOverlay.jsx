import { useEffect, useState } from "react";
import logoWhite from "../../../assets/logo-white.webp";
import "./WatermarkOverlay.css";

const POSITIONS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "center",
];

const SITE_NAME = "T-Square";

function WatermarkOverlay({ courseName }) {
  const [position, setPosition] = useState(POSITIONS[0]);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (!courseName) return undefined;

    const interval = setInterval(() => {
      setPosition((current) => {
        const currentIndex = POSITIONS.indexOf(current);
        const nextIndex = (currentIndex + 1) % POSITIONS.length;
        return POSITIONS[nextIndex];
      });
    }, 18000);

    return () => clearInterval(interval);
  }, [courseName]);

  if (!courseName) return null;

  return (
    <div className={`video-watermark video-watermark--${position}`} aria-hidden="true">
      <div className="video-watermark__content">
        {logoFailed ? (
          <span className="video-watermark__brand">{SITE_NAME}</span>
        ) : (
          <img
            src={logoWhite}
            alt={SITE_NAME}
            className="video-watermark__logo"
            onError={() => setLogoFailed(true)}
          />
        )}
        <span className="video-watermark__course">{courseName}</span>
      </div>
    </div>
  );
}

export default WatermarkOverlay;
