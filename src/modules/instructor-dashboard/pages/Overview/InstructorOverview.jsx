import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  ProgressBar,
  Badge,
  Spinner,
  Alert,
  Row,
  Col,
  Form,
  Card,
} from "react-bootstrap";
import DetailModal from "../../../../components/shared/DetailModal/DetailModal";
import AdminPagination from "../../../admin-dashboard/components/shared/AdminPagination";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  useInstructorStats,
  useInstructorGroups,
  useCompletedGroups,
  useGroupDetails,
} from "../../hooks/useInstructorDashboard";
import "../../../admin-dashboard/components/shared/AdminContentPage/AdminContentPage.css";
import "./InstructorOverview.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function SectionTitle({ icon, title, badge }) {
  return (
    <div className="d-flex align-items-center gap-3">
      <div
        className="bg-danger rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm"
        style={{ width: 40, height: 40, flexShrink: 0 }}
      >
        <i className={`bi ${icon} text-white`}></i>
      </div>
      <h2 className="ac-title mb-0 d-flex align-items-center gap-2 flex-wrap">
        {title}
        {badge}
      </h2>
    </div>
  );
}

// ── Stat Card — matches Admin .state pattern exactly ─────────────────────────

const STAT_COLORS = [
  { bg: "#e0f2fe", color: "#0ea5e9" },  // blue  — total
  { bg: "#e2f9eb", color: "#22c55e" },  // green — active
  { bg: "#f3e8ff", color: "#a855f7" },  // purple — completed
  { bg: "#fee2e2", color: "#ef4444" },  // red   — students
];

function StatCard({ icon, label, value, loading, colorIndex = 0 }) {
  const { bg, color } = STAT_COLORS[colorIndex % STAT_COLORS.length];
  return (
    <div
      className="state d-flex flex-column justify-content-between"
      style={{ minHeight: "130px" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div
          className="rounded-3 d-flex align-items-center justify-content-center"
          style={{ width: "40px", height: "40px", backgroundColor: bg, color, flexShrink: 0 }}
        >
          <i className={`bi ${icon} fs-5`}></i>
        </div>
      </div>
      <div>
        {loading ? (
          <Spinner animation="border" size="sm" variant="danger" className="mb-1" />
        ) : (
          <div className="fw-bold mb-1 state-value">{value ?? 0}</div>
        )}
        <span className="text-muted" style={{ fontSize: "0.82rem" }}>{label}</span>
      </div>
    </div>
  );
}

// ── Group Details Modal ───────────────────────────────────────────────────────

function GroupDetailsModal({ show, groupId, onHide }) {
  const { t } = useTranslation("instructorDashboard");
  const { details, loading, error } = useGroupDetails(groupId);

  const chartData = {
    labels: [t("modal.completed", "Completed"), t("modal.remaining", "Remaining")],
    datasets: [
      {
        data: [
          details?.completion?.percentage ?? 0,
          100 - (details?.completion?.percentage ?? 0),
        ],
        backgroundColor: ["#d32f2f", "#e9ecef"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed}%`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <DetailModal
      show={show}
      onHide={onHide}
      size="lg"
      scrollable
      title={
        loading
          ? t("modal.loading", "Loading…")
          : (details?.group_name ?? t("modal.title", "Group Details"))
      }
      footer={
        <button type="button" className="btn btn-outline-dark ac-add-btn" onClick={onHide}>
          {t("modal.close", "Close")}
        </button>
      }
      footerClassName="border-0"
    >
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      )}

      {error && !loading && (
        <Alert variant="danger">{error}</Alert>
      )}

      {!loading && details && (
        <>
          {/* Chart + quick stats */}
          <Row className="align-items-center mb-4">
            <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
              <div style={{ position: "relative", height: 180 }}>
                <Doughnut data={chartData} options={chartOptions} />
                <div className="doughnut-center-label">
                  <span className="fw-bold fs-4 text-danger">
                    {details.completion.percentage}%
                  </span>
                  <div className="text-muted small">{t("modal.completion", "Completion")}</div>
                </div>
              </div>
            </Col>

            <Col xs={12} md={8}>
              <Row className="g-3">
                <Col xs={6}>
                  <div className="border rounded-3 bg-light text-center p-3 shadow-sm h-100 d-flex flex-column justify-content-center">
                    <div className="fw-bold fs-5 text-danger">
                      {details.completion.completed_sessions}
                    </div>
                    <div className="text-muted small">
                      {t("modal.completedSessions", "Completed Sessions")}
                    </div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="border rounded-3 bg-light text-center p-3 shadow-sm h-100 d-flex flex-column justify-content-center">
                    <div className="fw-bold fs-5 text-secondary">
                      {details.completion.total_sessions}
                    </div>
                    <div className="text-muted small">
                      {t("modal.totalSessions", "Total Sessions")}
                    </div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="border rounded-3 bg-light text-center p-3 shadow-sm h-100 d-flex flex-column justify-content-center">
                    <div className="fw-bold fs-5 text-success">
                      {details.students_count}
                    </div>
                    <div className="text-muted small">
                      {t("modal.students", "Students")}
                    </div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="border rounded-3 bg-light text-center p-3 shadow-sm h-100 d-flex flex-column justify-content-center">
                    <div className="fw-bold fs-5">
                      <span className={`badge ${details.status === "active" ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"} rounded-pill px-3 py-2 fw-semibold`}>
                        {details.status}
                      </span>
                    </div>
                    <div className="text-muted small mt-1">
                      {t("modal.status", "Status")}
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Students table */}
          <h6 className="fw-bold mb-3 border-top pt-3">
            {t("modal.studentsAttendance", "Students Attendance")}
          </h6>

          {details.students.length === 0 ? (
            <Alert variant="info">{t("modal.noStudents", "No students enrolled in this group.")}</Alert>
          ) : (
            <div className="table-responsive">
              <Table hover size="sm" className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>{t("modal.name", "Name")}</th>
                    <th>{t("modal.attended", "Attended")}</th>
                    <th style={{ minWidth: 180 }}>
                      {t("modal.attendanceRate", "Attendance Rate")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {details.students.map((student, idx) => (
                    <tr key={student.student_id}>
                      <td className="text-muted">{idx + 1}</td>
                      <td>
                        <div className="fw-semibold">{student.full_name}</div>
                        {student.email && (
                          <div className="text-muted small">{student.email}</div>
                        )}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border rounded-pill px-2 py-1 fw-semibold">
                          {student.attended_sessions} / {details.completion.total_sessions}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <ProgressBar
                            now={student.attendance_percentage}
                            variant={
                              student.attendance_percentage >= 75
                                ? "success"
                                : student.attendance_percentage >= 50
                                  ? "warning"
                                  : "danger"
                            }
                            className="flex-grow-1"
                            style={{ height: 8 }}
                          />
                          <span className="text-muted small fw-semibold" style={{ minWidth: 40 }}>
                            {student.attendance_percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      )}
    </DetailModal>
  );
}

// ── Main Overview Page ────────────────────────────────────────────────────────

function InstructorOverview() {
  const { t } = useTranslation("instructorDashboard");

  const {
    stats,
    loading: statsLoading,
  } = useInstructorStats();

  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
  } = useInstructorGroups();

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [completedPage, setCompletedPage] = useState(1);
  const [completedPerPage, setCompletedPerPage] = useState(10);

  const {
    groups: completedGroups,
    loading: completedLoading,
    error: completedError,
    meta: completedMeta,
  } = useCompletedGroups(completedPage, completedPerPage);

  // ── Completed Groups pagination helpers ──────────────────────────────────
  const handleCompletedPerPageChange = (newPerPage) => {
    setCompletedPerPage(newPerPage);
    setCompletedPage(1);
  };

  const completedFrom = completedMeta ? (completedMeta.current_page - 1) * completedMeta.per_page + 1 : 0;
  const completedTo = completedMeta ? Math.min(completedMeta.current_page * completedMeta.per_page, completedMeta.total) : 0;
  const completedTotal = completedMeta?.total ?? 0;
  const lastPage = completedMeta?.last_page ?? 1;

  const statCards = [
    {
      key: "total",
      icon: "bi-collection-fill",
      label: t("stats.totalGroups", "Total Groups"),
      value: stats?.total_groups,
    },
    {
      key: "active",
      icon: "bi-play-circle-fill",
      label: t("stats.activeGroups", "Active Groups"),
      value: stats?.active_groups,
    },
    {
      key: "completed",
      icon: "bi-check-circle-fill",
      label: t("stats.completedGroups", "Completed Groups"),
      value: stats?.completed_groups,
    },
    {
      key: "students",
      icon: "bi-people-fill",
      label: t("stats.totalStudents", "Total Students"),
      value: stats?.total_students,
    },
  ];

  return (
    <div className="admin-content-page instructor-overview">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{t("overview.title", "Instructor Overview")}</h2>
          <p className="ac-subtitle text-muted mb-0">
            {t("overview.subtitle", "Welcome back, here is a summary of your groups and students.")}
          </p>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────── */}
      <Row className="g-3 mb-4">
        {statCards.map((card, idx) => (
          <Col key={card.key} xs={12} sm={6} xl={3}>
            <StatCard
              icon={card.icon}
              label={card.label}
              value={card.value}
              loading={statsLoading}
              colorIndex={idx}
            />
          </Col>
        ))}
      </Row>

      {/* ── Active Groups Table ──────────────────────────────────── */}
      <div className="ac-table-card mb-4">
        <div className="ac-table-container">
          <div className="ac-rounded-table">
            <div className="px-4 pt-4 pb-3 border-bottom">
              <SectionTitle
                icon="bi-table"
                title={t("groups.title", "Active Groups")}
              />
            </div>

            <div className="px-4 pb-4 pt-3">
              {groupsLoading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger mb-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="text-muted small">{t("groups.loading", "Loading groups…")}</div>
                </div>
              )}

              {groupsError && !groupsLoading && (
                <Alert variant="danger">{groupsError}</Alert>
              )}

              {!groupsLoading && !groupsError && groups.length === 0 && (
                <div className="text-center py-5 text-muted">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: 64, height: 64, background: "#fff1f2", color: "#be1522" }}
                  >
                    <i className="bi bi-people" style={{ fontSize: "2rem" }}></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-1">
                    {t("groups.noGroupsTitle", "No Active Groups")}
                  </h5>
                  <p className="small text-muted mb-0">
                    {t("groups.noGroups", "No active groups at the moment.")}
                  </p>
                </div>
              )}

              {!groupsLoading && groups.length > 0 && (
                <div className="table-responsive">
                  <table className="table ac-table mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>{t("groups.groupName", "Group")}</th>
                        <th>{t("groups.course", "Course")}</th>
                        <th className="text-center">{t("groups.students", "Students")}</th>
                        <th className="text-center" style={{ minWidth: 200 }}>{t("groups.progress", "Progress")}</th>
                        <th className="text-center">{t("groups.sessions", "Sessions")}</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((group) => (
                        <tr key={group.id}>
                          <td>
                            <div className="fw-semibold">{group.group_name}</div>
                            {group.start_date && (
                              <div className="text-muted small">
                                {group.start_date} → {group.end_date ?? "—"}
                              </div>
                            )}
                          </td>
                          <td className="text-muted">{group.course_title ?? "—"}</td>
                          <td className="text-center">
                            <span className="badge bg-light text-dark border rounded-pill px-3 py-1 fw-semibold">
                              {group.students_count}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <ProgressBar
                                now={group.completion_percentage}
                                variant={
                                  group.completion_percentage >= 75
                                    ? "success"
                                    : group.completion_percentage >= 40
                                      ? "warning"
                                      : "danger"
                                }
                                className="flex-grow-1"
                                style={{ height: 8 }}
                              />
                              <span className="text-muted small fw-semibold" style={{ minWidth: 40 }}>
                                {group.completion_percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="text-muted small">
                            {group.completed_sessions} / {group.total_sessions}
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-danger rounded-3 px-3 shadow-sm text-white d-inline-flex align-items-center gap-1"
                              onClick={() => setSelectedGroupId(group.id)}
                            >
                              <i className="bi bi-eye me-1"></i>
                              {t("groups.viewDetails", "Details")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Completed Groups Table ───────────────────────────────── */}
      <div className="ac-table-card mb-4">
        <div className="ac-table-container">
          <div className="ac-rounded-table">
            <div className="px-4 pt-4 pb-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
              <SectionTitle
                icon="bi-check2-circle"
                title={t("completedGroups.title", "Completed Groups")}
                badge={
                  !completedLoading && (
                    <Badge bg="danger" className="fw-normal fs-6">
                      {completedMeta?.total ?? completedGroups.length}
                    </Badge>
                  )
                }
              />
              <button
                type="button"
                className="btn btn-danger ac-add-btn"
                onClick={() => setShowCompleted((v) => !v)}
                aria-expanded={showCompleted}
              >
                <i className={`bi ${showCompleted ? "bi-chevron-up" : "bi-chevron-down"} me-1`}></i>
                {showCompleted
                  ? t("completedGroups.hide", "Hide")
                  : t("completedGroups.show", "Show")}
              </button>
            </div>

            {showCompleted && (
              <div className="px-4 pb-2 pt-3">
                {completedLoading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-danger mb-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="text-muted small">{t("completedGroups.loading", "Loading completed groups…")}</div>
                  </div>
                )}

                {completedError && !completedLoading && (
                  <Alert variant="danger">{completedError}</Alert>
                )}

                {!completedLoading && !completedError && completedGroups.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: 64, height: 64, background: "#fff1f2", color: "#be1522" }}
                    >
                      <i className="bi bi-check-circle" style={{ fontSize: "2rem" }}></i>
                    </div>
                    <h5 className="fw-bold text-dark mb-1">
                      {t("completedGroups.noGroupsTitle", "No Completed Groups")}
                    </h5>
                    <p className="small text-muted mb-0">
                      {t("completedGroups.noGroups", "No completed groups yet.")}
                    </p>
                  </div>
                )}

                {!completedLoading && completedGroups.length > 0 && (
                  <>
                    {/* Showing X to Y of Z + per_page selector */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                      <small className="text-muted">
                        {t(
                          "completedGroups.showing",
                          `Showing ${completedFrom}–${completedTo} of ${completedTotal} groups`,
                          { from: completedFrom, to: completedTo, total: completedTotal }
                        )}
                      </small>
                      <div className="d-flex align-items-center gap-2">
                        <small className="text-muted">{t("completedGroups.perPage", "Per page:")}</small>
                        <Form.Select
                          size="sm"
                          style={{ width: "80px" }}
                          value={completedPerPage}
                          onChange={(e) => handleCompletedPerPageChange(Number(e.target.value))}
                          aria-label="Rows per page"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </Form.Select>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table ac-table mb-0 align-middle">
                        <thead>
                          <tr>
                            <th>{t("completedGroups.groupName", "Group")}</th>
                            <th>{t("completedGroups.course", "Course")}</th>
                            <th className="text-center">{t("completedGroups.students", "Students")}</th>
                            <th>{t("completedGroups.completionDate", "Completion Date")}</th>
                            <th className="text-center">{t("completedGroups.totalSessions", "Total Sessions")}</th>
                            <th className="text-center">{t("completedGroups.status", "Status")}</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedGroups.map((group) => (
                            <tr key={group.id}>
                              <td>
                                <div className="fw-semibold">{group.group_name}</div>
                                {group.start_date && (
                                  <div className="text-muted small">
                                    {t("completedGroups.startedOn", "Started")} {group.start_date}
                                  </div>
                                )}
                              </td>
                              <td className="text-muted">{group.course_title ?? "—"}</td>
                              <td className="text-center">
                                <span className="badge bg-light text-dark border rounded-pill px-3 py-1 fw-semibold">
                                  {group.students_count}
                                </span>
                              </td>
                              <td>
                                {group.completion_date ? (
                                  <span className="text-success fw-semibold">
                                    <i className="bi bi-calendar-check me-1"></i>
                                    {group.completion_date}
                                  </span>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="text-center">
                                <span className="badge bg-light text-dark border rounded-pill px-3 py-1 fw-semibold">
                                  {group.total_sessions}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                                  <i className="bi bi-check-circle me-1"></i>
                                  {t("completedGroups.badge", "Completed")}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger rounded-3 px-3 shadow-sm text-white d-inline-flex align-items-center gap-1"
                                  onClick={() => setSelectedGroupId(group.id)}
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  {t("groups.viewDetails", "Details")}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* Pagination footer */}
                {!completedLoading && lastPage > 1 && (
                  <div className="py-3 border-top">
                    <AdminPagination
                      pagination={{
                        current_page: completedPage,
                        last_page: lastPage,
                      }}
                      onPageChange={setCompletedPage}
                      wrapperClassName="d-flex justify-content-center"
                      className="mb-0"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Group Details Modal ──────────────────────────────────── */}
      <GroupDetailsModal
        key={selectedGroupId}
        show={!!selectedGroupId}
        groupId={selectedGroupId}
        onHide={() => setSelectedGroupId(null)}
      />
    </div>
  );
}

export default InstructorOverview;
