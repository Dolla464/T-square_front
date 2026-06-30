import { useState } from "react";
import {
  Badge,
  Button,
  Col,
  Form,
  Modal,
  Pagination,
  Row,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useAdminSchedule } from "../../hooks/useAdminSchedule";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import "./AdminSchedule.css";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  upcoming:  { bg: "bg-primary-subtle text-primary",   icon: "bi-clock",              label: "Upcoming"  },
  active:    { bg: "bg-success-subtle text-success",   icon: "bi-play-circle-fill",   label: "Active"    },
  completed: { bg: "bg-secondary-subtle text-secondary", icon: "bi-check-circle-fill", label: "Completed" },
  cancelled: { bg: "bg-danger-subtle text-danger",     icon: "bi-x-circle-fill",      label: "Cancelled" },
};

const fmt = (t) => (t ? t.slice(0, 5) : "—");

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { bg: "bg-light text-dark", icon: "bi-circle", label: status };
  return (
    <span className={`badge rounded-pill px-2 py-1 ${cfg.bg}`} style={{ fontSize: "0.75rem" }}>
      <i className={`bi ${cfg.icon} me-1`}></i>
      {cfg.label}
    </span>
  );
}

// ── Filters Bar ───────────────────────────────────────────────────────────────

function ScheduleFilters({
  filters,
  viewMode,
  weekBounds,
  updateFilter,
  handleDateChange,
  setViewMode,
  resetFilters,
  instructors,
  instructorsLoading,
}) {
  return (
    <div className="ac-filters-bar mb-4">
      <Row className="align-items-end g-3">
        {/* Day / Week toggle */}
        <Col xs={12}>
          <div className="btn-group btn-group-sm" role="group" aria-label="View mode">
            <Button
              variant={viewMode === "day" ? "danger" : "outline-danger"}
              onClick={() => setViewMode("day")}
            >
              <i className="bi bi-calendar-day me-1"></i>Day
            </Button>
            <Button
              variant={viewMode === "week" ? "danger" : "outline-danger"}
              onClick={() => setViewMode("week")}
            >
              <i className="bi bi-calendar-week me-1"></i>Week
            </Button>
          </div>
        </Col>

        {/* Date */}
        <Col xs={12} sm={6} md={3}>
          <Form.Label className="fw-semibold small text-muted mb-1">
            <i className="bi bi-calendar-date me-1"></i>
            {viewMode === "week" ? "Pick a day in the week" : "Date"}
          </Form.Label>
          <Form.Control
            type="date"
            value={filters.date}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          {viewMode === "week" && weekBounds && (
            <div className="mt-1">
              <span
                className="badge rounded-pill px-2 py-1"
                style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "0.75rem" }}
              >
                <i className="bi bi-calendar-range me-1"></i>
                {weekBounds.from} → {weekBounds.to}
              </span>
            </div>
          )}
        </Col>

        {/* Instructor */}
        <Col xs={12} sm={6} md={3}>
          <Form.Label className="fw-semibold small text-muted mb-1">
            <i className="bi bi-person-badge me-1"></i>Instructor
          </Form.Label>
          <Form.Select
            value={filters.instructor_id}
            onChange={(e) => updateFilter("instructor_id", e.target.value)}
            disabled={instructorsLoading}
          >
            <option value="">All Instructors</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Status */}
        <Col xs={12} sm={6} md={2}>
          <Form.Label className="fw-semibold small text-muted mb-1">
            <i className="bi bi-funnel me-1"></i>Status
          </Form.Label>
          <Form.Select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </Col>

        {/* Per page */}
        <Col xs={6} sm={4} md={2}>
          <Form.Label className="fw-semibold small text-muted mb-1">
            <i className="bi bi-list-ol me-1"></i>Per Page
          </Form.Label>
          <Form.Select
            value={filters.per_page}
            onChange={(e) => updateFilter("per_page", Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Form.Select>
        </Col>

        {/* Reset */}
        <Col xs={6} sm={4} md={2} className="d-flex align-items-end">
          <Button variant="outline-secondary" size="sm" className="w-100" onClick={resetFilters}>
            <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
          </Button>
        </Col>
      </Row>
    </div>
  );
}

// ── Export & Print Bar ────────────────────────────────────────────────────────

function ExportBar({ onExport, loading }) {
  return (
    <div className="d-flex gap-2 flex-wrap">
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => onExport("pdf")}
        disabled={loading}
      >
        <i className="bi bi-file-earmark-pdf me-1"></i>PDF
      </Button>
      <Button
        variant="outline-success"
        size="sm"
        onClick={() => onExport("excel")}
        disabled={loading}
      >
        <i className="bi bi-file-earmark-spreadsheet me-1"></i>Excel
      </Button>
    </div>
  );
}

// ── Session Table ─────────────────────────────────────────────────────────────

function ScheduleTable({ sessions, loading, error, onReschedule, onCancel }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="danger" />
        <div className="text-muted mt-3 small">Loading schedule…</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
      </Alert>
    );
  }

  if (!sessions.length) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-calendar-x" style={{ fontSize: "3rem" }}></i>
        <p className="mt-3 fw-semibold">No sessions found for the selected filters.</p>
        <p className="small">Try a different date or instructor.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive ac-table-wrapper">
      <table className="table ac-table align-middle mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Group / Course</th>
            <th>Instructor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Room</th>
            <th>Students</th>
            <th>Session</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((sess, idx) => {
            const isEditable = !["completed", "cancelled"].includes(sess.status);
            const hasOverride = sess.override_date || sess.override_start_time;

            return (
              <tr key={sess.id} className={sess.status === "cancelled" ? "opacity-60" : ""}>
                <td className="text-muted small">{idx + 1}</td>

                {/* Group & Course */}
                <td>
                  <div className="fw-semibold" style={{ color: "#1a1a1a", fontSize: "0.9rem" }}>
                    {sess.group_name}
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                    <i className="bi bi-book me-1"></i>{sess.course_title}
                  </div>
                </td>

                {/* Instructor */}
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 30, height: 30, background: "#fee2e2", color: "#d32f2f", fontSize: "0.8rem" }}
                    >
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <span style={{ fontSize: "0.85rem" }}>{sess.instructor_name}</span>
                  </div>
                </td>

                {/* Date */}
                <td>
                  <div className="d-flex align-items-center gap-1">
                    <span style={{ fontSize: "0.85rem" }}>{sess.effective_date}</span>
                    {hasOverride && (
                      <Badge bg="warning" text="dark" pill style={{ fontSize: "0.65rem" }} title="Rescheduled">
                        R
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Time */}
                <td>
                  <span className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                    {fmt(sess.effective_start_time)} – {fmt(sess.effective_end_time)}
                  </span>
                </td>

                {/* Room */}
                <td className="text-muted small">{sess.room || "—"}</td>

                {/* Students */}
                <td className="text-center">
                  <span
                    className="badge rounded-pill px-2 py-1"
                    style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "0.8rem" }}
                  >
                    <i className="bi bi-people-fill me-1"></i>
                    {sess.student_count}
                  </span>
                </td>

                {/* Session number */}
                <td className="text-center">
                  <span className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                    {sess.session_number}
                  </span>
                  <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                    /{sess.total_sessions}
                  </span>
                </td>

                {/* Status */}
                <td>
                  <StatusBadge status={sess.status} />
                  {sess.cancellation_reason && (
                    <div className="text-muted mt-1" style={{ fontSize: "0.72rem" }} title={sess.cancellation_reason}>
                      <i className="bi bi-info-circle me-1"></i>
                      {sess.cancellation_reason.length > 30
                        ? sess.cancellation_reason.slice(0, 30) + "…"
                        : sess.cancellation_reason}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    {isEditable ? (
                      <>
                        <button
                          className="btn btn-sm btn-outline-primary p-1"
                          style={{ width: 30, height: 30 }}
                          title="Reschedule session"
                          onClick={() => onReschedule(sess)}
                        >
                          <i className="bi bi-pencil-fill" style={{ fontSize: "0.7rem" }}></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger p-1"
                          style={{ width: 30, height: 30 }}
                          title="Cancel session"
                          onClick={() => onCancel(sess)}
                        >
                          <i className="bi bi-x-lg" style={{ fontSize: "0.7rem" }}></i>
                        </button>
                      </>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Reschedule Modal ──────────────────────────────────────────────────────────

// Inner form — mounted fresh each time session changes (via key prop on wrapper)
function RescheduleForm({ session, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({
    date:       session.effective_date       ?? "",
    start_time: session.effective_start_time ? session.effective_start_time.slice(0, 5) : "",
    end_time:   session.effective_end_time   ? session.effective_end_time.slice(0, 5)   : "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.date)       errs.date       = "Date is required.";
    if (!form.start_time) errs.start_time = "Start time is required.";
    if (!form.end_time)   errs.end_time   = "End time is required.";
    if (form.start_time && form.end_time && form.start_time >= form.end_time)
      errs.end_time = "End time must be after start time.";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(session.id, form);
  };

  return (
    <>
      <div className="mb-3 p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div className="fw-semibold small text-muted mb-1">Current session:</div>
        <div className="fw-bold">{session.group_name}</div>
        <div className="text-muted small">
          {session.effective_date} &bull;&nbsp;
          {fmt(session.effective_start_time)} – {fmt(session.effective_end_time)}
          {session.room ? ` · Room ${session.room}` : ""}
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold small">New Date</Form.Label>
          <Form.Control
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            isInvalid={!!errors.date}
          />
          <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
        </Form.Group>

        <Row className="g-3">
          <Col>
            <Form.Group>
              <Form.Label className="fw-semibold small">Start Time</Form.Label>
              <Form.Control
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
                isInvalid={!!errors.start_time}
              />
              <Form.Control.Feedback type="invalid">{errors.start_time}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label className="fw-semibold small">End Time</Form.Label>
              <Form.Control
                type="time"
                value={form.end_time}
                onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
                isInvalid={!!errors.end_time}
              />
              <Form.Control.Feedback type="invalid">{errors.end_time}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Button variant="outline-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" className="me-1" /> : null}
            Reschedule & Notify
          </Button>
        </div>
      </Form>
    </>
  );
}

function RescheduleModal({ show, session, onClose, onSubmit, loading }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title>
          <i className="bi bi-pencil-fill text-primary me-2"></i>
          Reschedule Session
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {show && session && (
          // key forces a fresh mount (and fresh useState) whenever the session changes
          <RescheduleForm
            key={session.id}
            session={session}
            onClose={onClose}
            onSubmit={onSubmit}
            loading={loading}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}

// ── Cancel Modal ──────────────────────────────────────────────────────────────

function CancelModal({ show, session, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState("");

  const handleClose = () => { setReason(""); onClose(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(session.id, reason || null);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title>
          <i className="bi bi-x-circle-fill text-danger me-2"></i>
          Cancel Session
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {session && (
          <div className="mb-3 p-3 rounded-3" style={{ background: "#fff5f5", border: "1px solid #fecaca" }}>
            <div className="fw-bold">{session.group_name}</div>
            <div className="text-muted small">
              {session.effective_date} &bull;&nbsp;
              {fmt(session.effective_start_time)} – {fmt(session.effective_end_time)}
            </div>
          </div>
        )}

        <p className="text-muted small mb-3">
          Cancelling this session will send notifications to all enrolled students and the instructor.
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small">Cancellation Reason <span className="text-muted">(optional)</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g. Instructor unavailable, public holiday…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
            <Form.Text className="text-muted">{reason.length}/500</Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
              Keep Session
            </Button>
            <Button type="submit" variant="danger" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" className="me-1" /> : null}
              Cancel & Notify
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// ── Pagination Controls ───────────────────────────────────────────────────────

function PaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.total_pages <= 1) return null;

  const { current_page, total_pages, total, per_page } = pagination;
  const from = (current_page - 1) * per_page + 1;
  const to   = Math.min(current_page * per_page, total);

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, current_page - delta); i <= Math.min(total_pages, current_page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
      <span className="text-muted small">
        Showing {from}–{to} of {total} sessions
      </span>
      <Pagination size="sm" className="mb-0">
        <Pagination.First onClick={() => onPageChange(1)} disabled={current_page === 1} />
        <Pagination.Prev onClick={() => onPageChange(current_page - 1)} disabled={current_page === 1} />
        {pages[0] > 1 && <Pagination.Ellipsis disabled />}
        {pages.map((p) => (
          <Pagination.Item key={p} active={p === current_page} onClick={() => onPageChange(p)}>
            {p}
          </Pagination.Item>
        ))}
        {pages[pages.length - 1] < total_pages && <Pagination.Ellipsis disabled />}
        <Pagination.Next onClick={() => onPageChange(current_page + 1)} disabled={current_page === total_pages} />
        <Pagination.Last onClick={() => onPageChange(total_pages)} disabled={current_page === total_pages} />
      </Pagination>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function AdminSchedule() {
  const {
    sessions,
    pagination,
    loading,
    error,
    instructors,
    instructorsLoading,
    filters,
    viewMode,
    weekBounds,
    updateFilter,
    handleDateChange,
    setViewMode,
    resetFilters,
    handlePageChange,
    rescheduleModal,
    openRescheduleModal,
    closeRescheduleModal,
    cancelModal,
    openCancelModal,
    closeCancelModal,
    handleReschedule,
    handleCancel,
    handleExport,
    actionLoading,
    refetch,
  } = useAdminSchedule();

  return (
    <div className="admin-content-page" id="admin-schedule-page">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="ac-header d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="ac-title">
            <i className="bi bi-calendar-week me-2 text-danger"></i>Center Daily Schedule
          </h2>
          <p className="ac-subtitle text-muted mb-0">
            View, filter, edit and cancel sessions across all groups.
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <ExportBar onExport={handleExport} loading={actionLoading} />
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </Button>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <ScheduleFilters
        filters={filters}
        viewMode={viewMode}
        weekBounds={weekBounds}
        updateFilter={updateFilter}
        handleDateChange={handleDateChange}
        setViewMode={setViewMode}
        resetFilters={resetFilters}
        instructors={instructors}
        instructorsLoading={instructorsLoading}
      />

      {/* ── Stats strip ─────────────────────────────────────────────────────── */}
      {pagination && !loading && (
        <div className="d-flex gap-3 flex-wrap mb-3">
          {[
            { label: "Total",     value: pagination.total,   color: "#374151" },
            { label: "Shown",     value: pagination.count,   color: "#374151" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="px-3 py-2 rounded-3 small"
              style={{ background: "#f9f9fb", border: "1px solid #eaeaea" }}
            >
              <span className="text-muted me-1">{label}:</span>
              <span className="fw-bold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Table card ──────────────────────────────────────────────────────── */}
      <div className="ac-table-card">
        <div className="ac-filters-bar p-0 overflow-hidden">
          <ScheduleTable
            sessions={sessions}
            loading={loading}
            error={error}
            onReschedule={openRescheduleModal}
            onCancel={openCancelModal}
          />
        </div>
        <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
      </div>

      {/* ── Reschedule Modal ─────────────────────────────────────────────────── */}
      <RescheduleModal
        show={rescheduleModal.show}
        session={rescheduleModal.session}
        onClose={closeRescheduleModal}
        onSubmit={handleReschedule}
        loading={actionLoading}
      />

      {/* ── Cancel Modal ─────────────────────────────────────────────────────── */}
      <CancelModal
        show={cancelModal.show}
        session={cancelModal.session}
        onClose={closeCancelModal}
        onSubmit={handleCancel}
        loading={actionLoading}
      />
    </div>
  );
}

export default AdminSchedule;
