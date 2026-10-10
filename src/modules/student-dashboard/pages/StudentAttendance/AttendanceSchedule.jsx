import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import SessionStatusBadge from "../../../../components/shared/SessionStatusBadge/SessionStatusBadge";
import { useAttendanceSchedule } from "../../hooks/useAttendanceSchedule";
import StatusBadge from "./components/StatusBadge";
import { groupScheduleByDate } from "./utils/scheduleGrouping";
import "../../../admin-dashboard/components/shared/AdminContentPage/AdminContentPage.css";
import "../../styles/dashboardShared.css";
import "./StudentAttendance.css";
import { isArabicLocale } from "../../../../utils/isArabicLocale";

function ScheduleTableContent({ items, isArabic, t, emptyMessage }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-4 text-muted small">
        {emptyMessage ?? t("attendance.noSessionsToday")}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table ac-table mb-0 align-middle" dir={isArabic ? "rtl" : "ltr"}>
        <thead>
          <tr>
            <th>{t("attendance.course")}</th>
            <th>{t("attendance.date")}</th>
            <th>{t("attendance.time")}</th>
            <th>{t("attendance.room")}</th>
            <th>{t("attendance.session")}</th>
            <th>{t("attendance.yourStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.session_id}>
              <td>
                <div
                  className="fw-semibold"
                  style={{ color: "#1a1a1a", fontSize: "0.9rem" }}
                >
                  {item.course_title}
                </div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                  {item.group_name}
                </div>
              </td>
              <td>{item.session_date}</td>
              <td>
                {item.start_time} – {item.end_time}
              </td>
              <td>{item.room || "—"}</td>
              <td>
                <SessionStatusBadge status={item.status} isArabic={isArabic} />
              </td>
              <td>
                <StatusBadge status={item.student_status} compact />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleTable({ items, isArabic, t, emptyMessage, embedded = false }) {
  const content = (
    <ScheduleTableContent
      items={items}
      isArabic={isArabic}
      t={t}
      emptyMessage={emptyMessage}
    />
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="ac-table-card">
      <div className="ac-table-container">
        <div className="ac-rounded-table">{content}</div>
      </div>
    </div>
  );
}

function AttendanceSchedule() {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = isArabicLocale(i18n.language);
  const { schedule, loading, loadSchedule } = useAttendanceSchedule();
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());

  const groupedSchedule = useMemo(
    () => groupScheduleByDate(schedule, t),
    [schedule, t],
  );

  const todayGroup = useMemo(() => {
    const existing = groupedSchedule.find((group) => group.key === "today");
    if (existing) return existing;

    return {
      key: "today",
      label: t("attendance.today_label"),
      items: [],
    };
  }, [groupedSchedule, t]);

  const otherGroups = useMemo(
    () => groupedSchedule.filter((group) => group.key !== "today"),
    [groupedSchedule],
  );

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="student-attendance-page" dir={isArabic ? "rtl" : "ltr"}>
      <div className="attendance-page-header">
        <div>
          <h4 className="dash-page-title mb-1">{t("attendance.nav.schedule")}</h4>
          <p className="text-muted mb-0 small">{t("attendance.scheduleSubtitle")}</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-danger d-flex align-items-center gap-2"
          style={{ borderRadius: "10px", padding: "8px 16px", fontSize: "0.85rem", fontWeight: 600 }}
          onClick={() => loadSchedule()}
        >
          <i className="bi bi-arrow-clockwise" />
          {t("attendance.refresh")}
        </button>
      </div>

      {loading ? (
        <div className="dash-loading">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : groupedSchedule.length === 0 && todayGroup.items.length === 0 ? (
        <div className="ac-table-card">
          <div className="ac-table-container">
            <div className="ac-rounded-table py-5 text-center text-muted">
              <i className="bi bi-calendar-check fs-2 d-block mb-2" style={{ opacity: 0.5 }} />
              <p className="mb-0 small">{t("attendance.noUpcoming")}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="attendance-schedule-group">
            <h6 className="section-title mb-3">{todayGroup.label}</h6>
            <ScheduleTable items={todayGroup.items} isArabic={isArabic} t={t} />
          </section>

          {otherGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.key);

            return (
              <section
                key={group.key}
                className="attendance-schedule-group attendance-schedule-group-collapsible"
              >
                <div className="ac-table-card">
                  <div className="ac-table-container">
                    <div className="ac-rounded-table p-0 overflow-hidden">
                      <button
                        type="button"
                        className={`attendance-schedule-group-toggle ${isExpanded ? "is-expanded" : ""}`}
                        onClick={() => toggleGroup(group.key)}
                        aria-expanded={isExpanded}
                      >
                        <span className="attendance-schedule-group-toggle-label">
                          <span>{group.label}</span>
                          <span className="attendance-schedule-group-count">
                            {t("attendance.scheduleSectionCount", { count: group.items.length })}
                          </span>
                        </span>
                        <i className="bi bi-chevron-down attendance-schedule-group-chevron" />
                      </button>
                      {isExpanded ? (
                        <div className="attendance-schedule-group-table border-top">
                          <ScheduleTable
                            items={group.items}
                            isArabic={isArabic}
                            t={t}
                            emptyMessage={t("attendance.noUpcoming")}
                            embedded
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

export default AttendanceSchedule;
