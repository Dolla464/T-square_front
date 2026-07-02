import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Badge,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useAdminAttendance } from "../../hooks/useAdminAttendance";
import ExportBar from "../../components/shared/ExportBar";
import { selectClass } from "../../components/shared/adminUiStyles";
import StudentCourseAttendanceModal from "./StudentCourseAttendanceModal";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

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

const fmt = (t) => (t ? String(t).slice(0, 5) : "—");

const getEffectiveSession = (sess) => {
  const dateRaw = sess.override_date || sess.session_date || "";
  const effectiveDate = String(dateRaw).slice(0, 10);
  return {
    effectiveDate,
    effectiveStart: fmt(sess.override_start_time || sess.schedule?.start_time),
    effectiveEnd: fmt(sess.override_end_time || sess.schedule?.end_time),
  };
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

function AdminStudentAttendance() {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const {
    selectionGroups,
    sessions,
    sessionAttendance,
    loadingGroups,
    loadingSessions,
    loadingAttendance,
    exportLoading,
    loadGroups,
    loadSessions,
    loadSessionAttendance,
    handleExportSession,
    resetSessionData,
  } = useAdminAttendance();

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [modalStudent, setModalStudent] = useState(null);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!selectedGroupId) {
      resetSessionData();
      setSelectedSessionId("");
      return;
    }

    setSelectedSessionId("");
    setModalStudent(null);
    loadSessions(selectedGroupId);
  }, [selectedGroupId, loadSessions, resetSessionData]);

  useEffect(() => {
    if (!selectedGroupId || !selectedSessionId) return;
    loadSessionAttendance(selectedGroupId, selectedSessionId);
  }, [selectedGroupId, selectedSessionId, loadSessionAttendance]);

  const sessionOptions = useMemo(
    () =>
      sessions.map((session) => {
        const { effectiveDate, effectiveStart, effectiveEnd } =
          getEffectiveSession(session);
        return {
          id: session.id,
          label: `${effectiveDate} — ${effectiveStart}-${effectiveEnd}`,
        };
      }),
    [sessions]
  );

  const students = sessionAttendance?.students ?? [];
  const canExport = Boolean(selectedGroupId && selectedSessionId && students.length);

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
    setSelectedSessionId("");
    setModalStudent(null);
  };

  const handleSessionChange = (e) => {
    setSelectedSessionId(e.target.value);
    setModalStudent(null);
  };

  const openStudentModal = (student) => {
    setModalStudent({
      studentId: student.student_id,
      studentName: student.full_name,
      email: student.email,
    });
  };

  return (
    <div className="admin-content-page">
      <div className="ac-page-header mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {t("studentAttendance.title", "Students Attendance")}
          </h4>
          <p className="text-muted mb-0 small">
            {t(
              "studentAttendance.subtitle",
              "View session attendance records by group"
            )}
          </p>
        </div>
      </div>

      <div className="ac-filters-bar mb-4">
        <Row className="align-items-end g-3">
          <Col xs={12} md={5}>
            <Form.Label className="fw-semibold small text-muted mb-1">
              <i className="bi bi-people me-1"></i>
              {t("studentAttendance.selectGroup", "Select Group")}
            </Form.Label>
            <select
              className={selectClass(!!selectedGroupId)}
              value={selectedGroupId}
              onChange={handleGroupChange}
              disabled={loadingGroups}
            >
              <option value="">
                {t("studentAttendance.chooseGroup", "Choose a group…")}
              </option>
              {selectionGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </Col>

          <Col xs={12} md={5}>
            <Form.Label className="fw-semibold small text-muted mb-1">
              <i className="bi bi-calendar-event me-1"></i>
              {t("studentAttendance.selectSession", "Select Session")}
            </Form.Label>
            <select
              className={selectClass(!!selectedSessionId)}
              value={selectedSessionId}
              onChange={handleSessionChange}
              disabled={!selectedGroupId || loadingSessions}
            >
              <option value="">
                {selectedGroupId
                  ? t("studentAttendance.chooseSession", "Choose a session…")
                  : t("studentAttendance.selectGroupFirst", "Select a group first")}
              </option>
              {sessionOptions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.label}
                </option>
              ))}
            </select>
          </Col>
        </Row>
      </div>

      {!selectedGroupId && (
        <Alert variant="light" className="border text-center py-4">
          <i className="bi bi-funnel fs-3 text-muted d-block mb-2"></i>
          {t("studentAttendance.emptyGroup", "Select a group to get started.")}
        </Alert>
      )}

      {selectedGroupId && !selectedSessionId && loadingSessions && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      )}

      {selectedGroupId &&
        !selectedSessionId &&
        !loadingSessions &&
        sessions.length === 0 && (
          <Alert variant="light" className="border text-center py-4">
            <i className="bi bi-calendar-x fs-3 text-muted d-block mb-2"></i>
            {t("studentAttendance.noSessions", "No sessions found for this group.")}
          </Alert>
        )}

      {selectedGroupId &&
        !selectedSessionId &&
        !loadingSessions &&
        sessions.length > 0 && (
          <Alert variant="light" className="border text-center py-4">
            <i className="bi bi-calendar-week fs-3 text-muted d-block mb-2"></i>
            {t("studentAttendance.emptySession", "Select a session to view attendance.")}
          </Alert>
        )}

      {loadingAttendance && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      )}

      {selectedSessionId && !loadingAttendance && sessionAttendance && (
        <>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h6 className="fw-bold mb-1">
                {sessionAttendance.group_name}
                {sessionAttendance.course_title && (
                  <span className="text-muted fw-normal">
                    {" "}
                    — {sessionAttendance.course_title}
                  </span>
                )}
              </h6>
              <div className="text-muted small">
                {sessionAttendance.session_date} | {sessionAttendance.start_time}-
                {sessionAttendance.end_time}
              </div>
            </div>
            <ExportBar
              onExport={(format) =>
                handleExportSession(selectedGroupId, selectedSessionId, format)
              }
              loading={exportLoading}
              disabled={!canExport}
            />
          </div>

          {students.length === 0 ? (
            <Alert variant="info">
              {t("studentAttendance.noStudents", "No students enrolled in this group.")}
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>#</th>
                    <th>{t("studentAttendance.studentName", "Student Name")}</th>
                    <th>{t("studentAttendance.attendanceStatus", "Attendance Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.student_id}>
                      <td className="text-muted">{idx + 1}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
                          onClick={() => openStudentModal(student)}
                        >
                          {student.full_name}
                        </button>
                        {student.email && (
                          <div className="text-muted small">{student.email}</div>
                        )}
                      </td>
                      <td>
                        <AttendanceStatusBadge
                          status={student.status}
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

      <StudentCourseAttendanceModal
        show={Boolean(modalStudent)}
        groupId={selectedGroupId}
        studentId={modalStudent?.studentId}
        studentName={modalStudent?.studentName}
        onHide={() => setModalStudent(null)}
      />
    </div>
  );
}

export default AdminStudentAttendance;
