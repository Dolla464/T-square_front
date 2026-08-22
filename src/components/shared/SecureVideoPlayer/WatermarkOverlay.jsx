import { useEffect, useState } from "react";
import "./WatermarkOverlay.css";

const POSITIONS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "center",
];

function WatermarkOverlay({ watermark }) {
  const [position, setPosition] = useState(POSITIONS[0]);

  useEffect(() => {
    if (!watermark) return undefined;

    const interval = setInterval(() => {
      setPosition((current) => {
        const currentIndex = POSITIONS.indexOf(current);
        const nextIndex = (currentIndex + 1) % POSITIONS.length;
        return POSITIONS[nextIndex];
      });
    }, 18000);

    return () => clearInterval(interval);
  }, [watermark]);

  if (!watermark) return null;

  return (
    <div className={`video-watermark video-watermark--${position}`} aria-hidden="true">
      <div className="video-watermark__text">
        <span>{watermark.name}</span>
        {watermark.student_number ? <span>Student #{watermark.student_number}</span> : null}
      </div>
    </div>
  );
}

export default WatermarkOverlay;
