import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import DetailModal from "../../../../components/shared/DetailModal/DetailModal";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useAdminAttendance } from "../../hooks/useAdminAttendance";
import ExportBar from "../../components/shared/ExportBar";
import {
  buildAttendanceChartData,
  buildAttendanceChartOptions,
  countSessionsByStatus,
  resolveSessionStatus,
} from "../../../../utils/attendanceChart";

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
  useAttendanceHook = useAdminAttendance,
}) {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const {
    studentCourseAttendance,
    loadingSummary,
    exportLoading,
    loadStudentCourseAttendance,
    handleExportStudent,
  } = useAttendanceHook();

  useEffect(() => {
    if (show && groupId && studentId) {
      loadStudentCourseAttendance(groupId, studentId);
    }
  }, [show, groupId, studentId, loadStudentCourseAttendance]);

  const student = studentCourseAttendance;
  const sessions = studentCourseAttendance?.sessions ?? [];

  const statusCounts = useMemo(
    () => countSessionsByStatus(sessions),
    [sessions],
  );

  const { lateCount, absentCount } = useMemo(() => {
    const completed = sessions.filter((s) => s.session_status === "completed");

    return {
      lateCount: completed.filter((s) => resolveSessionStatus(s) === "late").length,
      absentCount: completed.filter((s) => resolveSessionStatus(s) === "absent")
        .length,
    };
  }, [sessions]);

  const chartLabelKeys = useMemo(
    () => ({
      present: "studentAttendance.presentSessions",
      late: "studentAttendance.lateSessions",
      absent: "studentAttendance.absentSessions",
      not_marked: "studentAttendance.notMarkedSessions",
    }),
    [],
  );

  const chartData = useMemo(
    () =>
      buildAttendanceChartData({
        counts: statusCounts,
        getLabel: (status) =>
          t(chartLabelKeys[status], status.replace("_", " ")),
      }),
    [statusCounts, t, chartLabelKeys],
  );

  const chartOptions = useMemo(
    () =>
      buildAttendanceChartOptions({
        isArabic,
        totalSessions: student?.total_sessions ?? sessions.length,
      }),
    [isArabic, student?.total_sessions, sessions.length],
  );

  const progressVariant =
    (student?.attendance_percentage ?? 0) >= 75
      ? "success"
      : (student?.attendance_percentage ?? 0) >= 50
        ? "warning"
        : "danger";

  return (
    <DetailModal
      show={show}
      onHide={onHide}
      size="lg"
      scrollable
      title={
        loadingSummary
          ? t("studentAttendance.loading", "Loading…")
          : studentName || t("studentAttendance.studentDetails", "Student Details")
      }
      footer={
        <>
          <ExportBar
            onExport={(format) => handleExportStudent(groupId, studentId, format)}
            loading={exportLoading}
            disabled={!student || loadingSummary}
          />
          <Button variant="secondary" onClick={onHide}>
            {t("studentAttendance.close", "Close")}
          </Button>
        </>
      }
      footerClassName="border-0 d-flex flex-wrap justify-content-between gap-2"
    >
        {loadingSummary && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {!loadingSummary && student && (
          <>
            <Row className="align-items-center mb-4">
              <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
                <div style={{ position: "relative", height: 220 }}>
                  <Doughnut data={chartData} options={chartOptions} />
                  <div
                    className="position-absolute top-50 start-50 translate-middle text-center"
                    style={{ pointerEvents: "none" }}
                  >
                    <span className="fw-bold fs-4 text-success">
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
                  <Col xs={6} lg={3}>
                    <Card className="border-0 bg-light text-center p-3">
                      <div className="fw-bold fs-5 text-success">
                        {student.attended_sessions}
                      </div>
                      <div className="text-muted small">
                        {t("studentAttendance.attendedSessions", "Attended Sessions")}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={6} lg={3}>
                    <Card className="border-0 bg-light text-center p-3">
                      <div className="fw-bold fs-5 text-warning">{lateCount}</div>
                      <div className="text-muted small">
                        {t("studentAttendance.lateSessions", "Late Sessions")}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={6} lg={3}>
                    <Card className="border-0 bg-light text-center p-3">
                      <div className="fw-bold fs-5 text-danger">{absentCount}</div>
                      <div className="text-muted small">
                        {t("studentAttendance.absentSessions", "Absent Sessions")}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={6} lg={3}>
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
    </DetailModal>
  );
}

export default StudentCourseAttendanceModal;
