import { Link, useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import SecureVideoPlayer from "../../../../components/shared/SecureVideoPlayer/SecureVideoPlayer";
import "./LessonPlayer.css";

function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const { i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  return (
    <div className="lesson-player-page">
      <div className="lesson-player-header d-flex justify-content-between align-items-center mb-4">
        <Link to={`/student/course/${courseId}`} className="btn btn-outline-secondary btn-sm">
          {isArabic ? "العودة للكورس" : "Back to Course"}
        </Link>
      </div>

      <div className="lesson-player-card bg-white border rounded-4 shadow-sm p-3 p-md-4">
        <SecureVideoPlayer
          lessonId={lessonId}
          onUnauthorized={() => {}}
          onUnavailable={() => {}}
        />
      </div>

      <p className="text-muted small mt-3 mb-0">
        {isArabic
          ? "العلامة المائية تهدف لتقليل إعادة التوزيع، وليست وسيلة منع تقنية للتحميل."
          : "The watermark discourages redistribution and is not a technical download-prevention control."}
      </p>
    </div>
  );
}

export default LessonPlayer;
