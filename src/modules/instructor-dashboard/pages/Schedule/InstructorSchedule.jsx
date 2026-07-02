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

const STATUS_VARIANT = {
  active:    "success",
  completed: "secondary",
  cancelled: "danger",
  pending:   "warning",
};

function StatusBadge({ status }) {
  const { t } = useTranslation("instructorDashboard");
  return (
    <Badge bg={STATUS_VARIANT[status] ?? "light"} text={STATUS_VARIANT[status] ? undefined : "dark"}>
      {t(`schedule.status.${status}`, status)}
    </Badge>
  );
}

// ── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({ session }) {
  const { t } = useTranslation("instructorDashboard");

  return (
    <Card className="session-card border-0 shadow-sm mb-3">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h6 className="fw-bold mb-1">{session.group_name}</h6>
            <div className="text-muted small mb-2">
              <i className="bi bi-book me-1 text-danger"></i>
              {session.course_title ?? "—"}
            </div>
          </div>
          <StatusBadge status={session.status} />
        </div>

        <div className="d-flex flex-wrap gap-3 mt-2">
          <div className="session-meta">
            <i className="bi bi-clock text-danger me-1"></i>
            <span className="fw-semibold">
              {session.start_time} – {session.end_time}
            </span>
          </div>

          {session.room && (
            <div className="session-meta">
              <i className="bi bi-door-open text-danger me-1"></i>
              <span>{t("schedule.room", "Room")}: {session.room}</span>
            </div>
          )}

          <div className="session-meta">
            <i className="bi bi-calendar3 text-danger me-1"></i>
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
    <div className="empty-state text-center py-5">
      <i className="bi bi-calendar-x text-danger" style={{ fontSize: "3rem" }}></i>
      <h5 className="mt-3 text-muted fw-semibold">
        {t("schedule.noSessions", "No sessions scheduled")}
      </h5>
      <p className="text-muted small">
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
            <span
              className="bg-danger rounded-3 p-2 d-inline-flex align-items-center justify-content-center shadow-sm"
              style={{ width: 40, height: 40 }}
            >
              <i className="bi bi-calendar-week text-white"></i>
            </span>
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
          className="btn ac-btn-view border-0 rounded-3 px-3 py-2 fw-medium"
          onClick={refetch}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          {t("schedule.refresh", "Refresh")}
        </button>
      </div>

      {/* ── Date Picker ─────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm mb-4 ac-filters-bar">
        <Card.Body className="p-3">
          <Row className="align-items-end g-3">
            <Col xs={12} sm={6} md={4}>
              <Form.Label className="fw-semibold small text-muted mb-1">
                <i className="bi bi-calendar-date me-1 text-danger"></i>
                {t("schedule.selectDate", "Select Date")}
              </Form.Label>
              <input
                type="date"
                className={dateInputClass(selectedDate)}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Col>
            <Col xs="auto" className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`${viewModeBtnClass(selectedDate === today)} ac-btn-view`}
                onClick={() => setSelectedDate(today)}
              >
                <i className="bi bi-calendar-check me-1"></i>
                {t("schedule.today", "Today")}
              </button>
              {selectedDate && (
                <button
                  type="button"
                  className={`${viewModeBtnClass(false)} ac-btn-view`}
                  onClick={handleClearDate}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  {t("schedule.showWeek", "Show Week")}
                </button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── Content ─────────────────────────────────────────────── */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      )}

      {error && !loading && (
        <Alert variant="danger">
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
  );
}

export default InstructorSchedule;
