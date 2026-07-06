import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Badge,
  Spinner,
  Alert,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { useInstructorSchedule } from "../../hooks/useInstructorDashboard";
import {
  dateInputClass,
  viewModeBtnClass,
} from "../../../admin-dashboard/components/shared/adminUiStyles";
import "../../../admin-dashboard/components/shared/AdminContentPage/AdminContentPage.css";
import "./InstructorSchedule.css";

// ── Status badge helper ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  upcoming:  { bg: "bg-primary-subtle text-primary",   icon: "bi-clock",              label: "Upcoming"  },
  active:    { bg: "bg-success-subtle text-success",   icon: "bi-play-circle-fill",   label: "Active"    },
  completed: { bg: "bg-secondary-subtle text-secondary", icon: "bi-check-circle-fill", label: "Completed" },
  cancelled: { bg: "bg-danger-subtle text-danger",     icon: "bi-x-circle-fill",      label: "Cancelled" },
  pending:   { bg: "bg-warning-subtle text-warning",   icon: "bi-clock-history",      label: "Pending"   },
};

function StatusBadge({ status }) {
  const { t } = useTranslation("instructorDashboard");
  const cfg = STATUS_CONFIG[status] ?? { bg: "bg-light text-dark", icon: "bi-circle", label: status };
  return (
    <span className={`badge rounded-pill px-2 py-1 ${cfg.bg}`} style={{ fontSize: "0.75rem" }}>
      <i className={`bi ${cfg.icon} me-1`}></i>
      {t(`schedule.status.${status}`, cfg.label)}
    </span>
  );
}

// ── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({ session }) {
  const { t } = useTranslation("instructorDashboard");

  return (
    <Card className="session-card mx-2 mb-3 border-0">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h6 className="fw-bold mb-1 text-dark">{session.group_name}</h6>
            <div className="text-muted small mb-2 d-flex align-items-center gap-1">
              <i className="bi bi-book"></i>
              <span>{session.course_title ?? "—"}</span>
            </div>
          </div>
          <StatusBadge status={session.status} />
        </div>

        <div className="d-flex flex-wrap gap-3 mt-3">
          <div className="session-meta">
            <i className="bi bi-clock"></i>
            <span className="fw-semibold">
              {session.start_time} – {session.end_time}
            </span>
          </div>

          {session.room && (
            <div className="session-meta">
              <i className="bi bi-door-open"></i>
              <span>{t("schedule.room", "Room")}: {session.room}</span>
            </div>
          )}

          <div className="session-meta">
            <i className="bi bi-calendar3"></i>
            <span>{session.session_date}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ date }) {
  const { t } = useTranslation("instructorDashboard");
  return (
    <div className="text-center py-5 text-muted">
      <div
        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
        style={{ width: 64, height: 64, background: "#f3f4f6", color: "#6b7280" }}
      >
        <i className="bi bi-calendar-x" style={{ fontSize: "2rem" }}></i>
      </div>
      <h5 className="fw-bold text-dark mb-1">
        {t("schedule.noSessions", "No sessions scheduled")}
      </h5>
      <p className="small text-muted mb-0">
        {date
          ? t("schedule.noSessionsForDate", `No sessions found for ${date}`)
          : t("schedule.noSessionsThisWeek", "No sessions scheduled for this week.")}
      </p>
    </div>
  );
}

// ── Day group header ──────────────────────────────────────────────────────────

function DayGroup({ date, sessions }) {
  const dayLabel = new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });

  return (
    <div className="day-group mb-4">
      <div className="day-label d-flex align-items-center gap-2 mb-3">
        <span className="ac-title mb-0">{dayLabel}</span>
        <Badge bg="danger" className="rounded-pill">{sessions.length}</Badge>
      </div>
      {sessions.map((session) => (
        <SessionCard key={session.session_id} session={session} />
      ))}
    </div>
  );
}

// ── Main Schedule Page ────────────────────────────────────────────────────────

function InstructorSchedule() {
  const { t } = useTranslation("instructorDashboard");

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState("");

  const { schedule, loading, error, refetch } = useInstructorSchedule(
    selectedDate || undefined
  );

  // Group sessions by date
  const sessionsByDate = {};
  if (schedule?.sessions) {
    schedule.sessions.forEach((s) => {
      if (!sessionsByDate[s.session_date]) sessionsByDate[s.session_date] = [];
      sessionsByDate[s.session_date].push(s);
    });
  }
  const sortedDates = Object.keys(sessionsByDate).sort();

  const handleClearDate = () => {
    setSelectedDate("");
  };

  return (
    <div className="admin-content-page instructor-schedule">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="ac-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <h2 className="ac-title d-flex align-items-center gap-2 mb-0">
            {t("schedule.title", "My Schedule")}
          </h2>
          {schedule && (
            <p className="ac-subtitle mb-0 mt-1">
              {schedule.type === "day"
                ? `${t("schedule.showing", "Showing")}: ${schedule.date}`
                : `${t("schedule.week", "Week")}: ${schedule.start_date} → ${schedule.end_date}`}
            </p>
          )}
        </div>

        <button
          type="button"
          className="btn btn-danger ac-add-btn"
          onClick={refetch}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          {t("schedule.refresh", "Refresh")}
        </button>
      </div>

      {/* ── Integrated Filter Bar and Content Card ──────────────── */}
      <div className="ac-table-card">
        <div className="ac-table-container">
          <div className="ac-rounded-table p-3 p-md-0">
            <div className="ac-filters-bar d-flex flex-column gap-3 mb-3">
              <section className="d-flex flex-column flex-md-row align-items-end justify-content-between gap-3 flex-wrap w-100">
                <div className="d-flex align-items-end gap-3 flex-wrap w-100 w-md-auto">
                  {/* Select Date */}
                  <div className="w-100 w-md-auto">
                    <label className="fw-semibold small text-muted mb-1 d-block">
                      <i className="bi bi-calendar-date me-1"></i>
                      {t("schedule.selectDate", "Select Date")}
                    </label>
                    <input
                      type="date"
                      className={`w-100 w-md-auto ${dateInputClass(!!selectedDate)}`}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{ minWidth: "11rem", flex: "0 0 auto" }}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 gap-md-3 flex-wrap flex-md-nowrap align-items-end w-100 w-md-auto">
                  <button
                    type="button"
                    className={`w-100 w-md-auto ${viewModeBtnClass(selectedDate === today)}`}
                    onClick={() => setSelectedDate(today)}
                  >
                    <i className="bi bi-calendar-check me-1"></i>
                    {t("schedule.today", "Today")}
                  </button>
                  {selectedDate && (
                    <button
                      type="button"
                      className="btn btn-outline-dark border-2 rounded-3 shadow-sm fw-semibold transition-all px-3 py-2 w-100 w-md-auto"
                      onClick={handleClearDate}
                      style={{ fontSize: "0.9rem" }}
                    >
                      <i className="bi bi-x-lg me-1"></i>
                      {t("schedule.showWeek", "Show Week")}
                    </button>
                  )}
                </div>
              </section>
            </div>

            {/* ── Content ─────────────────────────────────────────────── */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-danger mb-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="text-muted small">{t("schedule.loading", "Loading schedule…")}</div>
              </div>
            )}

            {error && !loading && (
              <Alert variant="danger" className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            {!loading && !error && schedule && (
              <>
                {sortedDates.length === 0 ? (
                  <EmptyState date={selectedDate} />
                ) : (
                  sortedDates.map((date) => (
                    <DayGroup key={date} date={date} sessions={sessionsByDate[date]} />
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorSchedule;
