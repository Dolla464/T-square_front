import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Table,
  ProgressBar,
  Badge,
  Spinner,
  Alert,
  Row,
  Col,
  Form,
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

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, loading }) {
  return (
    <Card className="stat-card border-0 shadow-sm h-100">
      <Card.Body className="d-flex align-items-center gap-3 p-4">
        <div className="stat-icon-wrapper bg-danger bg-opacity-10 rounded-3 p-3">
          <i className={`bi ${icon} fs-4 text-danger`}></i>
        </div>
        <div>
          <div className="text-muted small fw-semibold text-uppercase">{label}</div>
          {loading ? (
            <Spinner animation="border" size="sm" variant="danger" className="mt-1" />
          ) : (
            <div className="fw-bold fs-4">{value ?? 0}</div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

// ── Group Details Modal ───────────────────────────────────────────────────────

function GroupDetailsModal({ show, groupId, onHide }) {
  const { t }                     = useTranslation("instructorDashboard");
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
                    <Card className="border-0 bg-light text-center p-3">
                      <div className="fw-bold fs-5 text-danger">
                        {details.completion.completed_sessions}
                      </div>
                      <div className="text-muted small">
                        {t("modal.completedSessions", "Completed Sessions")}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={6}>
                    <Card className="border-0 bg-light text-center p-3">
                      <div className="fw-bold fs-5 text-secondary">
                        {details.completion.total_sessions}
                      </div>
                      <div className="text-muted small">
                        {t("modal.totalSessions", "Total Sessions")}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={6}>
                    <Card className="border-0 bg-light text-center p-3">
                      <div className="fw-bold fs-5 text-success">
                        {details.students_count}
                      </div>
                      <div className="text-muted small">
                        {t("modal.students", "Students")}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={6}>
                    <Card className="border-0 bg-light text-center p-3">
                      <div className="fw-bold fs-5">
                        <Badge bg={details.status === "active" ? "success" : "secondary"} className="px-3 py-2">
                          {details.status}
                        </Badge>
                      </div>
                      <div className="text-muted small mt-1">
                        {t("modal.status", "Status")}
                      </div>
                    </Card>
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
                          <Badge bg="light" text="dark" className="border">
                            {student.attended_sessions} / {details.completion.total_sessions}
                          </Badge>
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
  const [showCompleted, setShowCompleted]     = useState(true);
  const [completedPage, setCompletedPage]     = useState(1);
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

  const completedFrom  = completedMeta ? (completedMeta.current_page - 1) * completedMeta.per_page + 1 : 0;
  const completedTo    = completedMeta ? Math.min(completedMeta.current_page * completedMeta.per_page, completedMeta.total) : 0;
  const completedTotal = completedMeta?.total ?? 0;
  const lastPage       = completedMeta?.last_page ?? 1;

  const statCards = [
    {
      key:   "total",
      icon:  "bi-collection-fill",
      label: t("stats.totalGroups", "Total Groups"),
      value: stats?.total_groups,
    },
    {
      key:   "active",
      icon:  "bi-play-circle-fill",
      label: t("stats.activeGroups", "Active Groups"),
      value: stats?.active_groups,
    },
    {
      key:   "completed",
      icon:  "bi-check-circle-fill",
      label: t("stats.completedGroups", "Completed Groups"),
      value: stats?.completed_groups,
    },
    {
      key:   "students",
      icon:  "bi-people-fill",
      label: t("stats.totalStudents", "Total Students"),
      value: stats?.total_students,
    },
  ];

  return (
    <div className="admin-content-page instructor-overview">
      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        {statCards.map((card) => (
          <Col key={card.key} xs={12} sm={6} xl={3}>
            <StatCard
              icon={card.icon}
              label={card.label}
              value={card.value}
              loading={statsLoading}
            />
          </Col>
        ))}
      </Row>

      {/* ── Active Groups Table ──────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
          <SectionTitle
            icon="bi-table"
            title={t("groups.title", "Active Groups")}
          />
        </Card.Header>

        <Card.Body className="px-4 pb-4 pt-3">
          {groupsLoading && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="danger" />
            </div>
          )}

          {groupsError && !groupsLoading && (
            <Alert variant="danger">{groupsError}</Alert>
          )}

          {!groupsLoading && !groupsError && groups.length === 0 && (
            <Alert variant="info" className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              {t("groups.noGroups", "No active groups at the moment.")}
            </Alert>
          )}

          {!groupsLoading && groups.length > 0 && (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>{t("groups.groupName", "Group")}</th>
                    <th>{t("groups.course", "Course")}</th>
                    <th className="text-center">{t("groups.students", "Students")}</th>
                    <th style={{ minWidth: 200 }}>{t("groups.progress", "Progress")}</th>
                    <th>{t("groups.sessions", "Sessions")}</th>
                    <th></th>
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
                        <Badge bg="light" text="dark" className="border px-2 py-1">
                          {group.students_count}
                        </Badge>
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
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm ac-btn-view border-0"
                          onClick={() => setSelectedGroupId(group.id)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          {t("groups.viewDetails", "Details")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ── Completed Groups Table ───────────────────────────────── */}
      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-white border-0 pt-4 pb-0 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
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
            className="btn btn-outline-dark ac-add-btn"
            style={{ color: "#ffffff" }}
            onClick={() => setShowCompleted((v) => !v)}
            aria-expanded={showCompleted}
          >
            <i className={`bi ${showCompleted ? "bi-chevron-up" : "bi-chevron-down"} me-1`}></i>
            {showCompleted
              ? t("completedGroups.hide", "Hide")
              : t("completedGroups.show", "Show")}
          </button>
        </Card.Header>

        {showCompleted && (
          <>
            <Card.Body className="px-4 pb-2 pt-3">
              {completedLoading && (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="danger" />
                </div>
              )}

              {completedError && !completedLoading && (
                <Alert variant="danger">{completedError}</Alert>
              )}

              {!completedLoading && !completedError && completedGroups.length === 0 && (
                <Alert variant="light" className="mb-0 border text-muted">
                  <i className="bi bi-info-circle me-2 text-danger"></i>
                  {t("completedGroups.noGroups", "No completed groups yet.")}
                </Alert>
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
                    <Table hover className="align-middle mb-0">
                      <thead style={{ backgroundColor: "#fff1f2" }}>
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
                              <Badge bg="light" text="dark" className="border px-2 py-1">
                                {group.students_count}
                              </Badge>
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
                              <Badge bg="light" text="dark" className="border px-2 py-1">
                                {group.total_sessions}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <Badge bg="success" className="px-3 py-2">
                                <i className="bi bi-check-circle me-1"></i>
                                {t("completedGroups.badge", "Completed")}
                              </Badge>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm ac-btn-view border-0"
                                onClick={() => setSelectedGroupId(group.id)}
                              >
                                <i className="bi bi-eye me-1"></i>
                                {t("groups.viewDetails", "Details")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
            </Card.Body>

            {/* Pagination footer — only when more than one page */}
            {!completedLoading && lastPage > 1 && (
              <Card.Footer className="bg-white border-0 px-4 pb-4 pt-2">
                <AdminPagination
                  pagination={{
                    current_page: completedPage,
                    last_page: lastPage,
                  }}
                  onPageChange={setCompletedPage}
                  wrapperClassName="d-flex justify-content-center"
                  className="mb-0"
                />
              </Card.Footer>
            )}
          </>
        )}
      </Card>

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
