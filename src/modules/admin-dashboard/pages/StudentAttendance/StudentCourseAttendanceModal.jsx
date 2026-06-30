import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Modal,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useAdminAttendance } from "../../hooks/useAdminAttendance";

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_CONFIG = {
  present: {
    bg: "success-subtle text-success",
    icon: "bi-check-circle-fill",
    labelEn: "Present",
    labelAr: "حاضر",
  },
  absent: {
    bg: "danger-subtle text-danger",
    icon: "bi-x-circle-fill",
    labelEn: "Absent",
    labelAr: "غائب",
  },
  late: {
    bg: "warning-subtle text-warning",
    icon: "bi-clock-fill",
    labelEn: "Late",
    labelAr: "متأخر",
  },
  not_marked: {
    bg: "secondary-subtle text-secondary",
    icon: "bi-dash-circle",
    labelEn: "Not Marked",
    labelAr: "لم يسجَّل",
  },
};

function ExportBar({ onExport, loading, disabled }) {
  return (
    <div className="d-flex gap-2 flex-wrap">
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => onExport("pdf")}
        disabled={loading || disabled}
      >
        <i className="bi bi-file-earmark-pdf me-1"></i>PDF
      </Button>
      <Button
        variant="outline-success"
        size="sm"
        onClick={() => onExport("excel")}
        disabled={loading || disabled}
      >
        <i className="bi bi-file-earmark-spreadsheet me-1"></i>Excel
      </Button>
    </div>
  );
}

function AttendanceStatusBadge({ status, isArabic }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_marked;
  return (
    <span
      className={`badge rounded-pill px-2 py-1 ${cfg.bg}`}
      style={{ fontSize: "0.75rem" }}
    >
      <i className={`bi ${cfg.icon} me-1`}></i>
      {isArabic ? cfg.labelAr : cfg.labelEn}
    </span>
  );
}

function StudentCourseAttendanceModal({
  show,
  groupId,
  studentId,
  studentName,
  onHide,
}) {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const {
    studentCourseAttendance,
    loadingSummary,
    exportLoading,
    loadStudentCourseAttendance,
    handleExportStudent,
  } = useAdminAttendance();

  useEffect(() => {
    if (show && groupId && studentId) {
      loadStudentCourseAttendance(groupId, studentId);
    }
  }, [show, groupId, studentId, loadStudentCourseAttendance]);

  const student = studentCourseAttendance;
  const sessions = studentCourseAttendance?.sessions ?? [];

  const chartData = {
    labels: [
      t("studentAttendance.attended", "Attended"),
      t("studentAttendance.remaining", "Remaining"),
    ],
    datasets: [
      {
        data: [
          student?.attendance_percentage ?? 0,
          100 - (student?.attendance_percentage ?? 0),
        ],
        backgroundColor: ["#0d6efd", "#e9ecef"],
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

  const progressVariant =
    (student?.attendance_percentage ?? 0) >= 75
      ? "success"
      : (student?.attendance_percentage ?? 0) >= 50
        ? "warning"
        : "danger";

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          {loadingSummary
            ? t("studentAttendance.loading", "Loading…")
            : studentName || t("studentAttendance.studentDetails", "Student Details")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loadingSummary && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {!loadingSummary && student && (
          <>
            <Row className="align-items-center mb-4">
              <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
                <div style={{ position: "relative", height: 180 }}>
                  <Doughnut data={chartData} options={chartOptions} />
                  <div
                    className="position-absolute top-50 start-50 translate-middle text-center"
                    style={{ pointerEvents: "none" }}
                  >
                    <span className="fw-bold fs-4 text-primary">
                      {student.attendance_percentage}%
                    </span>
                    <div className="text-muted small">
                      {t("studentAttendance.attendanceRate", "Attendance Rate")}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={12} md={8}>
                <Row className="g-3">
                  <Col xs={6}>
                    <Card className="border-0 bg-light text-center p-3">
                      <div className="fw-bold fs-5 text-primary">
                        {student.attended_sessions}
                      </div>
                      <div className="text-muted small">
                        {t("studentAttendance.attendedSessions", "Attended Sessions")}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={6}>
                    <Card className="border-0 bg-light text-center p-3">
                      <div className="fw-bold fs-5 text-secondary">
                        {student.total_sessions}
                      </div>
                      <div className="text-muted small">
                        {t("studentAttendance.totalSessions", "Total Sessions")}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12}>
                    <div className="d-flex align-items-center gap-2">
                      <ProgressBar
                        now={student.attendance_percentage}
                        variant={progressVariant}
                        className="flex-grow-1"
                        style={{ height: 8 }}
                      />
                      <span
                        className="text-muted small fw-semibold"
                        style={{ minWidth: 40 }}
                      >
                        {student.attendance_percentage}%
                      </span>
                    </div>
                  </Col>
                  <Col xs={12}>
                    {student.email && (
                      <div className="text-muted small">{student.email}</div>
                    )}
                    <div className="text-muted small mt-1">
                      {student.group_name}
                      {student.course_title && ` — ${student.course_title}`}
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 border-top pt-3">
              {t("studentAttendance.courseAttendance", "Course Attendance")}
            </h6>

            <div className="mb-3">
              <Badge bg="light" text="dark" className="border">
                {student.attended_sessions} / {student.total_sessions}
              </Badge>
            </div>

            {sessions.length === 0 ? (
              <Alert variant="info">
                {t("studentAttendance.noSessions", "No sessions found for this group.")}
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover size="sm" className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>{t("studentAttendance.sessionDate", "Session Date")}</th>
                      <th>{t("studentAttendance.time", "Time")}</th>
                      <th>{t("studentAttendance.attendanceStatus", "Attendance Status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, idx) => (
                      <tr key={session.session_id}>
                        <td className="text-muted">{idx + 1}</td>
                        <td>{session.session_date || "—"}</td>
                        <td>
                          {session.start_time || "—"} - {session.end_time || "—"}
                        </td>
                        <td>
                          <AttendanceStatusBadge
                            status={session.status}
                            isArabic={isArabic}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        )}

        {!loadingSummary && show && !student && (
          <Alert variant="warning">
            {t("studentAttendance.studentNotFound", "Student data not found.")}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 d-flex flex-wrap justify-content-between gap-2">
        <ExportBar
          onExport={(format) => handleExportStudent(groupId, studentId, format)}
          loading={exportLoading}
          disabled={!student || loadingSummary}
        />
        <Button variant="secondary" onClick={onHide}>
          {t("studentAttendance.close", "Close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default StudentCourseAttendanceModal;
