import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import DetailModal from "../../../../components/shared/DetailModal/DetailModal";
import { useAdminSchedule } from "../../hooks/useAdminSchedule";
import ExportBar from "../../components/shared/ExportBar";
import AdminPagination from "../../components/shared/AdminPagination";
import {
  selectClass,
  dateInputClass,
  viewModeBtnClass,
} from "../../components/shared/adminUiStyles";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import "./AdminSchedule.css";
import { isArabicLocale } from "../../../../utils/isArabicLocale";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  upcoming: { bg: "bg-primary-subtle text-primary", icon: "bi-clock", labelKey: "status_upcoming" },
  active: { bg: "bg-success-subtle text-success", icon: "bi-play-circle-fill", labelKey: "status_active" },
  completed: { bg: "bg-secondary-subtle text-secondary", icon: "bi-check-circle-fill", labelKey: "status_completed" },
  cancelled: { bg: "bg-danger-subtle text-danger", icon: "bi-x-circle-fill", labelKey: "status_cancelled" },
};

const fmt = (time) => (time ? time.slice(0, 5) : "—");

function StatusBadge({ status }) {
  const { t } = useTranslation("adminDashboard");
  const style = STATUS_STYLE[status];
  const cfg = style
    ? { ...style, label: t(`schedule_page.${style.labelKey}`) }
    : { bg: "bg-light text-dark", icon: "bi-circle", label: status };
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
  monthBounds,
  updateFilter,
  handleDateChange,
  setViewMode,
  resetFilters,
  instructors,
  instructorsLoading,
}) {
  const { t } = useTranslation("adminDashboard");
  const dateLabel =
    viewMode === "week"
      ? t("schedule_page.filter_pick_week")
      : viewMode === "month"
        ? t("schedule_page.filter_pick_month")
        : t("schedule_page.filter_date");

  const rangeBounds = viewMode === "month" ? monthBounds : weekBounds;

  return (
    <div className="ac-filters-bar schedule-filters-bar mb-3">
      {/* Row 1: Day / Week / Month */}
      <div className="schedule-filters-row schedule-filters-row--view">
        <div className="ac-tabs-menu schedule-view-tabs">
          <button
            type="button"
            className={`ac-tab-btn ${viewMode === "day" ? "active" : ""}`}
            onClick={() => setViewMode("day")}
          >
            <i className="bi bi-calendar-day me-1"></i>{t("schedule_page.view_day")}
          </button>
          <button
            type="button"
            className={`ac-tab-btn ${viewMode === "week" ? "active" : ""}`}
            onClick={() => setViewMode("week")}
          >
            <i className="bi bi-calendar-week me-1"></i>{t("schedule_page.view_week")}
          </button>
          <button
            type="button"
            className={`ac-tab-btn ${viewMode === "month" ? "active" : ""}`}
            onClick={() => setViewMode("month")}
          >
            <i className="bi bi-calendar-month me-1"></i>{t("schedule_page.view_month")}
          </button>
        </div>
      </div>

      {/* Row 2: Date + Instructor + Status + Per Page */}
      <div className="schedule-filters-row schedule-filters-row--controls">
        <div className="schedule-filter-group schedule-filter-group--date">
          <label className="schedule-filter-label fw-semibold small text-muted mb-1 d-block">
            <i className="bi bi-calendar-date me-1"></i>
            {dateLabel}
          </label>
          <input
            type="date"
            className={`schedule-filter-control w-100 ${dateInputClass(filters.date)}`}
            value={filters.date}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          {(viewMode === "week" || viewMode === "month") && rangeBounds && (
            <span className="schedule-range-badge badge rounded-pill px-2 py-1 border-danger bg-danger-subtle text-danger-emphasis">
              <i className="bi bi-calendar-range me-1"></i>
              {rangeBounds.from} → {rangeBounds.to}
            </span>
          )}
        </div>

        <div className="schedule-filter-group schedule-filter-group--instructor">
          <label className="schedule-filter-label fw-semibold small text-muted mb-1 d-block">
            <i className="bi bi-person-badge me-1"></i>{t("schedule_page.filter_instructor")}
          </label>
          <select
            className={`schedule-filter-control w-100 ${selectClass(!!filters.instructor_id)}`}
            value={filters.instructor_id}
            onChange={(e) => updateFilter("instructor_id", e.target.value)}
            disabled={instructorsLoading}
          >
            <option value="">{t("schedule_page.filter_all_instructors")}</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="schedule-filter-group schedule-filter-group--status">
          <label className="schedule-filter-label fw-semibold small text-muted mb-1 d-block">
            <i className="bi bi-funnel me-1"></i>{t("schedule_page.filter_status")}
          </label>
          <select
            className={`schedule-filter-control w-100 ${selectClass(!!filters.status)}`}
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
          >
            <option value="">{t("schedule_page.filter_all_statuses")}</option>
            <option value="upcoming">{t("schedule_page.status_upcoming")}</option>
            <option value="active">{t("schedule_page.status_active")}</option>
            <option value="completed">{t("schedule_page.status_completed")}</option>
            <option value="cancelled">{t("schedule_page.status_cancelled")}</option>
          </select>
        </div>

        <div className="schedule-filter-group schedule-filter-group--per-page">
          <label className="schedule-filter-label fw-semibold small text-muted mb-1 d-block">
            <i className="bi bi-list-ol me-1"></i>{t("schedule_page.filter_per_page")}
          </label>
          <select
            className={`schedule-filter-control w-100 ${selectClass(filters.per_page !== 15)}`}
            value={filters.per_page}
            onChange={(e) => updateFilter("per_page", Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Row 3: Reset */}
      <div className="schedule-filters-row schedule-filters-row--reset">
        <button
          type="button"
          className="btn ac-btn-view border-0 rounded-3 px-3 py-2 fw-medium schedule-reset-btn"
          onClick={resetFilters}
        >
          <i className="bi bi-arrow-counterclockwise me-1"></i>{t("schedule_page.filter_reset")}
        </button>
      </div>
    </div>
  );
}

// ── Session Table ─────────────────────────────────────────────────────────────

function ScheduleTable({ sessions, loading, error, onReschedule, onCancel, readOnly = false }) {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = isArabicLocale(i18n.language);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger mb-2" role="status">
          <span className="visually-hidden">{t("schedule_page.loading")}</span>
        </div>
        <div className="text-muted small">{t("schedule_page.loading")}</div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64, background: "#fff1f2", color: "#be1522" }}>
          <i className="bi bi-calendar-x" style={{ fontSize: "2rem" }}></i>
        </div>
        <h5 className="fw-bold text-dark mb-1">{t("schedule_page.empty_title")}</h5>
        <p className="small text-muted mb-0">{t("schedule_page.empty_hint")}</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table ac-table mb-0 align-middle" dir={isArabic ? "rtl" : "ltr"}>
        <thead>
          <tr>
            <th>#</th>
            <th>{t("schedule_page.col_group_course")}</th>
            <th>{t("schedule_page.col_instructor")}</th>
            <th>{t("schedule_page.col_date")}</th>
            <th>{t("schedule_page.col_time")}</th>
            <th>{t("schedule_page.col_room")}</th>
            <th>{t("schedule_page.col_students")}</th>
            <th>{t("schedule_page.col_session")}</th>
            <th>{t("schedule_page.col_status")}</th>
            {!readOnly && <th className="text-center">{t("schedule_page.col_actions")}</th>}
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
                      <Badge bg="warning" text="dark" pill style={{ fontSize: "0.65rem" }} title={t("schedule_page.rescheduled_title")}>
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
                {!readOnly && (
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      {isEditable ? (
                        <>
                          <button
                            className="btn btn-sm ac-btn-edit border-0"
                            title={t("schedule_page.reschedule_action")}
                            onClick={() => onReschedule(sess)}
                          >
                            <i className="bi bi-pencil-square fs-6"></i>
                          </button>
                          <button
                            className="btn btn-sm ac-btn-deleteTable border-0"
                            title={t("schedule_page.cancel_action")}
                            onClick={() => onCancel(sess)}
                          >
                            <i className="bi bi-trash fs-6"></i>
                          </button>
                        </>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </div>
                  </td>
                )}
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
  const { t } = useTranslation("adminDashboard");
  const [form, setForm] = useState({
    date: session.effective_date ?? "",
    start_time: session.effective_start_time ? session.effective_start_time.slice(0, 5) : "",
    end_time: session.effective_end_time ? session.effective_end_time.slice(0, 5) : "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.date) errs.date = t("schedule_page.error_date_required");
    if (!form.start_time) errs.start_time = t("schedule_page.error_start_required");
    if (!form.end_time) errs.end_time = t("schedule_page.error_end_required");
    if (form.start_time && form.end_time && form.start_time >= form.end_time)
      errs.end_time = t("schedule_page.error_end_after_start");
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
        <div className="fw-semibold small text-muted mb-1">{t("schedule_page.current_session")}</div>
        <div className="fw-bold">{session.group_name}</div>
        <div className="text-muted small">
          {session.effective_date} &bull;&nbsp;
          {fmt(session.effective_start_time)} – {fmt(session.effective_end_time)}
          {session.room ? ` · ${t("schedule_page.room_prefix", { room: session.room })}` : ""}
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold small">{t("schedule_page.new_date")}</Form.Label>
          <Form.Control
            type="date"
            className={dateInputClass(form.date)}
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            isInvalid={!!errors.date}
          />
          <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
        </Form.Group>

        <Row className="g-3">
          <Col>
            <Form.Group>
              <Form.Label className="fw-semibold small">{t("schedule_page.start_time")}</Form.Label>
              <Form.Control
                type="time"
                className={dateInputClass(form.start_time)}
                value={form.start_time}
                onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
                isInvalid={!!errors.start_time}
              />
              <Form.Control.Feedback type="invalid">{errors.start_time}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label className="fw-semibold small">{t("schedule_page.end_time")}</Form.Label>
              <Form.Control
                type="time"
                className={dateInputClass(form.end_time)}
                value={form.end_time}
                onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
                isInvalid={!!errors.end_time}
              />
              <Form.Control.Feedback type="invalid">{errors.end_time}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn ac-draft-btn border px-3" onClick={onClose} disabled={loading}>
            {t("schedule_page.cancel")}
          </button>
          <button type="submit" className="btn ac-publish-btn text-white px-3" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" className="me-1" /> : null}
            {t("schedule_page.reschedule_submit")}
          </button>
        </div>
      </Form>
    </>
  );
}

function RescheduleModal({ show, session, onClose, onSubmit, loading }) {
  const { t } = useTranslation("adminDashboard");

  return (
    <DetailModal
      show={show}
      onHide={onClose}
      title={
        <>
          <i className="bi bi-pencil-fill text-danger me-2"></i>
          {t("schedule_page.reschedule_modal_title")}
        </>
      }
    >
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
    </DetailModal>
  );
}

// ── Cancel Modal ──────────────────────────────────────────────────────────────

function CancelModal({ show, session, onClose, onSubmit, loading }) {
  const { t } = useTranslation("adminDashboard");
  const [reason, setReason] = useState("");

  const handleClose = () => { setReason(""); onClose(); };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(session.id, reason || null);
  };

  return (
    <DetailModal
      show={show}
      onHide={handleClose}
      title={
        <>
          <i className="bi bi-x-circle-fill text-danger me-2"></i>
          {t("schedule_page.cancel_modal_title")}
        </>
      }
    >
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
        {t("schedule_page.cancel_modal_description")}
      </p>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold small">
            {t("schedule_page.cancellation_reason")}{" "}
            <span className="text-muted">{t("schedule_page.optional")}</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            className={`${dateInputClass(reason)} py-2`}
            placeholder={t("schedule_page.cancellation_placeholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />
          <Form.Text className="text-muted">{reason.length}/500</Form.Text>
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn ac-draft-btn border px-3" onClick={handleClose} disabled={loading}>
            {t("schedule_page.keep_session")}
          </button>
          <button type="submit" className="btn ac-publish-btn text-white px-3" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" className="me-1" /> : null}
            {t("schedule_page.cancel_submit")}
          </button>
        </div>
      </Form>
    </DetailModal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function AdminSchedule({ useScheduleHook = useAdminSchedule, readOnly = false }) {
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
    monthBounds,
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
  } = useScheduleHook();
  const { t } = useTranslation("adminDashboard");

  return (
    <div className="admin-content-page" id="admin-schedule-page">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="ac-header d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="ac-title">{t("schedule_page.title")}</h2>
          <p className="ac-subtitle text-muted mb-0">
            {readOnly
              ? t("schedule_page.subtitle_readonly")
              : t("schedule_page.subtitle")}
          </p>
        </div>
        <ExportBar onExport={handleExport} loading={actionLoading} />
      </div>

      <div className="ac-table-card">
        <div className="ac-table-container">
          <div className="ac-rounded-table p-3 p-md-0">
            <ScheduleFilters
              filters={filters}
              viewMode={viewMode}
              weekBounds={weekBounds}
              monthBounds={monthBounds}
              updateFilter={updateFilter}
              handleDateChange={handleDateChange}
              setViewMode={setViewMode}
              resetFilters={resetFilters}
              instructors={instructors}
              instructorsLoading={instructorsLoading}
            />

            {/* {pagination && !loading && (
              <div className="d-flex gap-3 flex-wrap mb-3 px-3 px-md-4">
                {[
                  { label: "Total", value: pagination.total, color: "#374151" },
                  { label: "Shown", value: pagination.count, color: "#374151" },
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
            )} */}

            <ScheduleTable
              sessions={sessions}
              loading={loading}
              error={error}
              onReschedule={openRescheduleModal}
              onCancel={openCancelModal}
              readOnly={readOnly}
            />
          </div>
          <AdminPagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      </div>

      {/* ── Reschedule Modal ─────────────────────────────────────────────────── */}
      {!readOnly && (
        <RescheduleModal
          show={rescheduleModal.show}
          session={rescheduleModal.session}
          onClose={closeRescheduleModal}
          onSubmit={handleReschedule}
          loading={actionLoading}
        />
      )}

      {/* ── Cancel Modal ─────────────────────────────────────────────────────── */}
      {!readOnly && (
        <CancelModal
          show={cancelModal.show}
          session={cancelModal.session}
          onClose={closeCancelModal}
          onSubmit={handleCancel}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

export default AdminSchedule;
