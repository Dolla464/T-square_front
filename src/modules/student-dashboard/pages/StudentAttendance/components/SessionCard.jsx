import { useTranslation } from "react-i18next";
import SessionStatusBadge from "../../../../../components/shared/SessionStatusBadge/SessionStatusBadge";
import StatusBadge from "./StatusBadge";
import { isArabicLocale } from "../../../../../utils/isArabicLocale";

export default function SessionCard({
  session,
  isActive,
  isArabic,
  onSelect,
  compact = false,
}) {
  const { t, i18n } = useTranslation("studentDashboard");
  const localeIsArabic = isArabic ?? isArabicLocale(i18n.language);

  return (
    <button
      type="button"
      className={`student-session-card ${isActive ? "active" : ""} ${compact ? "student-session-card-compact" : ""}`}
      onClick={() => onSelect?.(session)}
    >
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div className="text-start">
          <strong className="d-block text-dark" style={{ fontSize: compact ? "0.88rem" : "0.92rem" }}>
            {session.course_title}
          </strong>
          <span className="small text-muted d-block mt-1">{session.group_name}</span>
          <span className="small text-muted d-block mt-1">
            <i className="bi bi-clock me-1" />
            {session.start_time} – {session.end_time}
            {session.room ? ` · ${t("attendance.room_prefix")} ${session.room}` : ""}
          </span>
        </div>
        {!compact && (
          <div className="d-flex flex-column align-items-end gap-2">
            <SessionStatusBadge status={session.status} isArabic={localeIsArabic} />
            <StatusBadge status={session.student_status} />
          </div>
        )}
      </div>
    </button>
  );
}
