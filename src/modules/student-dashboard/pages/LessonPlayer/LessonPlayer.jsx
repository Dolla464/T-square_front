import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import SecureVideoPlayer from "../../../../components/shared/SecureVideoPlayer/SecureVideoPlayer";
import { useCourseDetails } from "../../hooks/useCousrsesDetails";
import "./LessonPlayer.css";

function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const { i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const { courseData, loading, error } = useCourseDetails(courseId);

  if (loading) {
    return (
      <div
        className="lesson-player-page d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="lesson-player-page lesson-player-page--error" dir={isArabic ? "rtl" : "ltr"}>
        <div className="alert alert-danger mb-0">
          {error || (isArabic ? "تعذّر تحميل الدرس" : "Unable to load lesson")}
        </div>
      </div>
    );
  }

  const lesson = courseData.lessons?.find((item) => String(item.id) === String(lessonId));

  if (!lesson) {
    return (
      <div className="lesson-player-page lesson-player-page--error" dir={isArabic ? "rtl" : "ltr"}>
        <div className="alert alert-danger mb-0">
          {isArabic ? "الدرس غير موجود" : "Lesson not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-player-page" dir={isArabic ? "rtl" : "ltr"}>
      <Helmet>
        <title>
          {lesson.title
            ? `${lesson.title} | T-Square`
            : `${isArabic ? "عرض الدرس" : "Lesson"} | T-Square`}
        </title>
      </Helmet>

      <header className="lesson-player-header">
        <h1 className="lesson-player-title">{lesson.title}</h1>
        {lesson.description ? (
          <p className="lesson-player-description">{lesson.description}</p>
        ) : null}
      </header>

      <div className="lesson-player-card bg-white border rounded-4 shadow-sm">
        <SecureVideoPlayer
          lessonId={lessonId}
          courseTitle={courseData.title}
          isArabic={isArabic}
          onUnauthorized={() => {}}
          onUnavailable={() => {}}
        />
      </div>

      <p className="lesson-player-note text-muted small mt-3 mb-0">
        {isArabic
          ? "العلامة المائية تهدف لتقليل إعادة التوزيع، وليست وسيلة منع تقنية للتحميل."
          : "The watermark discourages redistribution and is not a technical download-prevention control."}
      </p>
    </div>
  );
}

export default LessonPlayer;
