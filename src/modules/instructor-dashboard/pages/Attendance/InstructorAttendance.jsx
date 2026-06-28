import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Spinner,
  Badge,
  ProgressBar,
  Modal,
  Button,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import { useInstructorAttendance } from "../../hooks/useInstructorAttendance";
import { useAttendanceRealtime } from "../../hooks/useAttendanceRealtime";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

const RECENT_SCANS_LIMIT = 10;

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  present: {
    bg: "#d1e7dd",
    color: "#0f5132",
    icon: "bi-check-circle-fill",
    labelEn: "Present",
    labelAr: "حاضر",
  },
  absent: {
    bg: "#f8d7da",
    color: "#842029",
    icon: "bi-x-circle-fill",
    labelEn: "Absent",
    labelAr: "غائب",
  },
  late: {
    bg: "#fff3cd",
    color: "#664d03",
    icon: "bi-clock-fill",
    labelEn: "Late",
    labelAr: "متأخر",
  },
  not_marked: {
    bg: "#e2e3e5",
    color: "#41464b",
    icon: "bi-dash-circle",
    labelEn: "Not Marked",
    labelAr: "لم يسجَّل",
  },
};

const SESSION_STATUS_CONFIG = {
  upcoming: { bg: "secondary", labelEn: "Upcoming", labelAr: "قادمة" },
  active:   { bg: "success",   labelEn: "Active",   labelAr: "نشطة" },
  completed:{ bg: "danger",    labelEn: "Completed", labelAr: "منتهية" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function StatusBadge({ status, isArabic }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_marked;
  return (
    <span
      className="badge rounded-pill px-3 py-2 fw-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.color, fontSize: "0.8rem" }}
    >
      <i className={`bi ${cfg.icon} me-1`}></i>
      {isArabic ? cfg.labelAr : cfg.labelEn}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

function InstructorAttendance() {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const {
    todaySessions,
    activeSession,
    students,
    loading,
    detailLoading,
    qrCode,
    qrLoading,
    markAttendance,
    markAllPresent,
    loadQrCode,
    selectSession,
  } = useInstructorAttendance();

  const [showQrModal, setShowQrModal]   = useState(false);
  const [recentScans, setRecentScans]   = useState([]);
  const [toastMessage, setToastMessage] = useState(null); // { name, status }

  // ── Real-time polling ──────────────────────────────────────────────────────

  const handleStudentScanned = useCallback((record) => {
    // Update the recent scans list (newest first, capped at limit)
    setRecentScans((prev) => [record, ...prev].slice(0, RECENT_SCANS_LIMIT));

    // Show toast notification for 3 seconds
    setToastMessage({ name: record.student_name, status: record.status });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const { isPolling } = useAttendanceRealtime(
    activeSession?.session_id ?? null,
    handleStudentScanned
  );

  // ── Helpers ────────────────────────────────────────────────────────────────

  const todayLabel = new Date().toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleShowQr = async () => {
    if (!activeSession?.session_id) return;
    setShowQrModal(true);
    await loadQrCode(activeSession.session_id);
  };

  const handleCloseQr = () => {
    setShowQrModal(false);
  };

  const notMarkedCount = students.filter((s) => s.status === "not_marked").length;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="admin-content-page" dir={isArabic ? "rtl" : "ltr"}>

      {/* ── TOAST NOTIFICATIONS ── */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
        <Toast
          show={!!toastMessage}
          onClose={() => setToastMessage(null)}
          bg={toastMessage?.status === "present" ? "success" : toastMessage?.status === "late" ? "warning" : "secondary"}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <i className="bi bi-qr-code-scan me-2"></i>
            <strong className="me-auto">
              {isArabic ? "مسح جديد" : "New Scan"}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            <strong>{toastMessage?.name}</strong>
            {" — "}
            {toastMessage?.status === "present"
              ? (isArabic ? "حاضر" : "Present")
              : toastMessage?.status === "late"
              ? (isArabic ? "متأخر" : "Late")
              : (isArabic ? "غائب" : "Absent")}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* ── PAGE HEADER ── */}
      <div className="ac-header d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="ac-title d-flex align-items-center gap-2">
            {isArabic ? "الحضور والغياب" : "Attendance"}
            {isPolling && (
              <span title={isArabic ? "تحديث تلقائي كل 5 ثواني" : "Auto-updating every 5s"}>
                <Spinner
                  animation="border"
                  variant="danger"
                  size="sm"
                  style={{ width: "0.75rem", height: "0.75rem", borderWidth: "2px" }}
                />
              </span>
            )}
          </h2>
          <p className="ac-subtitle text-muted mb-0">
            <i className="bi bi-calendar3 me-2"></i>
            {todayLabel}
          </p>
        </div>

        {activeSession && (
          <Button
            variant="outline-success"
            className="d-flex align-items-center gap-2 fw-medium"
            style={{ minHeight: "44px" }}
            onClick={handleShowQr}
            disabled={activeSession.status !== "active"}
          >
            <i className="bi bi-qr-code fs-5"></i>
            {isArabic ? "عرض رمز QR" : "Show QR Code"}
          </Button>
        )}
      </div>

      {/* ── TODAY'S SESSION CARDS ── */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : todaySessions.length === 0 ? (
        <div
          className="text-center py-5 rounded-4 border"
          style={{ background: "#fafafa" }}
        >
          <i className="bi bi-calendar-x fs-1 text-muted d-block mb-3"></i>
          <p className="text-muted fw-medium mb-0">
            {isArabic ? "لا توجد جلسات مجدولة اليوم" : "No sessions scheduled for today"}
          </p>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {todaySessions.map((session) => {
              const isActive = activeSession?.session_id === session.session_id;
              const ssCfg = SESSION_STATUS_CONFIG[session.status] ?? SESSION_STATUS_CONFIG.upcoming;
              const progressPct =
                session.attendance?.total > 0
                  ? Math.round((session.attendance.present / session.attendance.total) * 100)
                  : 0;

              return (
                <div key={session.session_id} className="col-sm-6 col-xl-4">
                  <div
                    className="card h-100 shadow-sm"
                    style={{
                      borderRadius: "14px",
                      cursor: "pointer",
                      border: isActive
                        ? "2.5px solid #dc3545"
                        : "1.5px solid #e9ecef",
                      background: isActive ? "#fff5f5" : "#fff",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => selectSession(session)}
                  >
                    <div className="card-body p-3">
                      {/* Card header */}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1 me-2">
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "0.9rem" }}>
                            {session.group_name}
                          </h6>
                          <small className="text-muted">{session.course_title}</small>
                        </div>
                        <Badge bg={ssCfg.bg} className="rounded-pill">
                          {isArabic ? ssCfg.labelAr : ssCfg.labelEn}
                        </Badge>
                      </div>

                      {/* Time and room */}
                      <div className="d-flex flex-wrap gap-3 mb-3 small text-secondary">
                        <span>
                          <i className="bi bi-clock me-1"></i>
                          {session.start_time} – {session.end_time}
                        </span>
                        {session.room && (
                          <span>
                            <i className="bi bi-door-open me-1"></i>
                            {session.room}
                          </span>
                        )}
                      </div>

                      {/* Attendance progress */}
                      <div>
                        <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.8rem" }}>
                          <span className="text-muted">
                            {isArabic ? "الحضور" : "Attendance"}
                          </span>
                          <span className="fw-bold text-dark">
                            {session.attendance?.present ?? 0} / {session.attendance?.total ?? 0}
                          </span>
                        </div>
                        <ProgressBar
                          now={progressPct}
                          variant={progressPct >= 80 ? "success" : progressPct >= 50 ? "warning" : "danger"}
                          style={{ height: "6px", borderRadius: "3px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── ACTIVE SESSION DETAIL BAR ── */}
          {activeSession && (
            <div
              className="card border-0 shadow-sm mb-4 p-3"
              style={{ borderRadius: "14px", background: "linear-gradient(135deg,#fff5f5,#fff)" }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <h5 className="fw-bold text-dark mb-1">
                    <i className="bi bi-collection-play me-2 text-danger"></i>
                    {activeSession.group_name}
                  </h5>
                  <p className="mb-0 text-muted small">
                    {activeSession.course_title} &nbsp;·&nbsp;
                    <i className="bi bi-clock me-1"></i>
                    {activeSession.start_time} – {activeSession.end_time}
                    {activeSession.room && (
                      <>
                        &nbsp;·&nbsp;
                        <i className="bi bi-door-open me-1"></i>
                        {activeSession.room}
                      </>
                    )}
                  </p>
                </div>

                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <div className="text-center">
                    <div className="fw-bold fs-5 text-dark">
                      {activeSession.attendance?.present ?? 0}
                      <span className="text-muted fw-normal fs-6">
                        /{activeSession.attendance?.total ?? 0}
                      </span>
                    </div>
                    <small className="text-muted">
                      {isArabic ? "حاضر" : "Present"}
                    </small>
                  </div>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    style={{ minHeight: "44px" }}
                    onClick={handleShowQr}
                    disabled={activeSession.status !== "active"}
                  >
                    <i className="bi bi-qr-code me-1"></i>
                    {isArabic ? "رمز QR" : "QR Code"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── RECENT SCANS ── */}
          {activeSession && (
            <div className="ac-table-card mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                <h5 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-activity me-2 text-danger"></i>
                  {isArabic ? "آخر عمليات المسح" : "Recent Scans"}
                  <Badge bg="danger" className="ms-2 rounded-pill" style={{ fontSize: "0.75rem" }}>
                    {recentScans.length}
                  </Badge>
                </h5>
                {isPolling && (
                  <span className="text-muted small d-flex align-items-center gap-1">
                    <Spinner animation="border" size="sm" variant="secondary"
                      style={{ width: "0.65rem", height: "0.65rem", borderWidth: "2px" }} />
                    {isArabic ? "يتحدث كل 5 ثواني" : "Updating every 5s"}
                  </span>
                )}
              </div>

              <div
                className="card border-0 shadow-sm overflow-hidden"
                style={{ borderRadius: "14px", background: "#f8f9fc" }}
              >
                {recentScans.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-hourglass-split fs-3 d-block mb-2 opacity-50"></i>
                    <small>
                      {isArabic
                        ? "لا توجد عمليات مسح بعد. ستظهر هنا فور وصولها."
                        : "No scans yet. New scans will appear here in real time."}
                    </small>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table mb-0 align-middle" dir="ltr">
                      <thead>
                        <tr style={{ background: "#f0f0f0" }}>
                          <th className="ps-4 py-3 border-0 text-secondary small fw-bold">
                            {isArabic ? "الطالب" : "Student"}
                          </th>
                          <th className="py-3 border-0 text-secondary small fw-bold text-center">
                            {isArabic ? "الحالة" : "Status"}
                          </th>
                          <th className="py-3 pe-4 border-0 text-secondary small fw-bold text-center">
                            {isArabic ? "وقت المسح" : "Scanned At"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentScans.map((scan, idx) => (
                          <tr
                            key={`${scan.record_id ?? scan.student_id}-${idx}`}
                            style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                          >
                            <td className="ps-4 py-3 fw-bold text-dark" style={{ fontSize: "0.9rem" }}>
                              <i className="bi bi-person me-2 text-muted"></i>
                              {scan.student_name}
                            </td>
                            <td className="py-3 text-center">
                              <StatusBadge status={scan.status} isArabic={isArabic} />
                            </td>
                            <td className="py-3 pe-4 text-center text-muted small">
                              {scan.marked_at
                                ? new Date(scan.marked_at).toLocaleTimeString(
                                    isArabic ? "ar-EG" : "en-US",
                                    { hour: "2-digit", minute: "2-digit", second: "2-digit" }
                                  )
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STUDENTS TABLE ── */}
          {activeSession && (
            <div className="ac-table-card">
              <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                <h5 className="fw-bold mb-0 text-dark">
                  <i className="bi bi-people me-2 text-danger"></i>
                  {isArabic ? "قائمة الطلاب" : "Student List"}
                  {notMarkedCount > 0 && (
                    <Badge bg="secondary" className="ms-2 rounded-pill" style={{ fontSize: "0.75rem" }}>
                      {notMarkedCount} {isArabic ? "لم يسجَّل" : "unmarked"}
                    </Badge>
                  )}
                </h5>

                <Button
                  variant="outline-success"
                  size="sm"
                  style={{ minHeight: "44px" }}
                  onClick={markAllPresent}
                  disabled={detailLoading || notMarkedCount === 0}
                >
                  <i className="bi bi-check-all me-1"></i>
                  {isArabic ? "تحضير الكل" : "Mark All Present"}
                </Button>
              </div>

              <div
                className="card border-0 shadow-sm overflow-hidden"
                style={{ borderRadius: "14px", background: "#f8f9fc" }}
              >
                {detailLoading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="danger" size="sm" />
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table mb-0 align-middle" dir="ltr">
                      <thead>
                        <tr style={{ background: "#f0f0f0" }}>
                          <th className="ps-4 py-3 border-0 text-secondary small fw-bold">
                            {isArabic ? "الطالب" : "Student"}
                          </th>
                          <th className="py-3 border-0 text-secondary small fw-bold text-center">
                            {isArabic ? "الحالة" : "Status"}
                          </th>
                          <th className="py-3 border-0 text-secondary small fw-bold text-center">
                            {isArabic ? "وقت التسجيل" : "Marked At"}
                          </th>
                          <th className="py-3 pe-4 border-0 text-secondary small fw-bold text-center">
                            {isArabic ? "إجراءات" : "Actions"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-4 text-muted">
                              {isArabic ? "لا يوجد طلاب في هذه الجلسة" : "No students in this session"}
                            </td>
                          </tr>
                        ) : (
                          students.map((student) => {
                            const cfg = STATUS_CONFIG[student.status] ?? STATUS_CONFIG.not_marked;
                            return (
                              <tr
                                key={student.student_id}
                                style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                              >
                                {/* Avatar + name */}
                                <td className="ps-4 py-3">
                                  <div className="d-flex align-items-center gap-3">
                                    {student.avatar ? (
                                      <img
                                        src={student.avatar}
                                        alt={student.full_name}
                                        className="rounded-circle"
                                        style={{ width: 38, height: 38, objectFit: "cover" }}
                                      />
                                    ) : (
                                      <div
                                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                        style={{
                                          width: 38,
                                          height: 38,
                                          fontSize: "0.85rem",
                                          background: "linear-gradient(135deg,#dc3545,#c41230)",
                                          flexShrink: 0,
                                        }}
                                      >
                                        {getInitials(student.full_name)}
                                      </div>
                                    )}
                                    <div>
                                      <div className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>
                                        {student.full_name}
                                      </div>
                                      {student.email && (
                                        <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                                          {student.email}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Status badge */}
                                <td className="py-3 text-center">
                                  <StatusBadge status={student.status} isArabic={isArabic} />
                                </td>

                                {/* Marked at */}
                                <td className="py-3 text-center text-muted small">
                                  {student.marked_at
                                    ? new Date(student.marked_at).toLocaleTimeString(
                                        isArabic ? "ar-EG" : "en-US",
                                        { hour: "2-digit", minute: "2-digit" }
                                      )
                                    : "—"}
                                </td>

                                {/* Action buttons */}
                                <td className="py-3 pe-4 text-center">
                                  <div className="d-flex justify-content-center gap-1 flex-wrap">
                                    {/* Mark Present */}
                                    <button
                                      className="btn btn-sm border-0 fw-medium"
                                      title={isArabic ? "تحضير" : "Mark Present"}
                                      disabled={student.status === "present"}
                                      style={{
                                        minHeight: "44px",
                                        minWidth: "44px",
                                        background: student.status === "present" ? "#d1e7dd" : "#f8f9fa",
                                        color: student.status === "present" ? "#0f5132" : "#495057",
                                        borderRadius: "10px",
                                      }}
                                      onClick={() => markAttendance(student.student_id, "present")}
                                    >
                                      <i className="bi bi-check-lg fs-5"></i>
                                    </button>

                                    {/* Mark Late */}
                                    <button
                                      className="btn btn-sm border-0 fw-medium"
                                      title={isArabic ? "متأخر" : "Mark Late"}
                                      disabled={student.status === "late"}
                                      style={{
                                        minHeight: "44px",
                                        minWidth: "44px",
                                        background: student.status === "late" ? "#fff3cd" : "#f8f9fa",
                                        color: student.status === "late" ? "#664d03" : "#495057",
                                        borderRadius: "10px",
                                      }}
                                      onClick={() => markAttendance(student.student_id, "late")}
                                    >
                                      <i className="bi bi-clock fs-5"></i>
                                    </button>

                                    {/* Mark Absent */}
                                    <button
                                      className="btn btn-sm border-0 fw-medium"
                                      title={isArabic ? "غائب" : "Mark Absent"}
                                      disabled={student.status === "absent"}
                                      style={{
                                        minHeight: "44px",
                                        minWidth: "44px",
                                        background: student.status === "absent" ? "#f8d7da" : "#f8f9fa",
                                        color: student.status === "absent" ? "#842029" : "#495057",
                                        borderRadius: "10px",
                                      }}
                                      onClick={() => markAttendance(student.student_id, "absent")}
                                    >
                                      <i className="bi bi-x-lg fs-5"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── QR CODE MODAL ── */}
      <Modal
        show={showQrModal}
        onHide={handleCloseQr}
        centered
        size="sm"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-6">
            <i className="bi bi-qr-code me-2 text-danger"></i>
            {isArabic ? "رمز الحضور" : "Attendance QR Code"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center pb-4">
          {qrLoading ? (
            <div className="py-4">
              <Spinner animation="border" variant="danger" />
              <p className="text-muted mt-3 mb-0 small">
                {isArabic ? "جاري التحميل..." : "Loading QR code..."}
              </p>
            </div>
          ) : qrCode ? (
            <>
              <div
                className="d-inline-block p-3 rounded-3 mb-3"
                style={{ background: "#fff", border: "2px solid #f0f0f0" }}
              >
                <QRCodeSVG value={qrCode} size={220} level="H" includeMargin />
              </div>
              <p className="text-muted small mb-0">
                <i className="bi bi-info-circle me-1"></i>
                {isArabic
                  ? "اعرض هذا الرمز للطلاب ليسجلوا حضورهم"
                  : "Show this code to students to scan and record attendance"}
              </p>
              <div
                className="mt-3 p-2 rounded-3 text-break"
                style={{ background: "#f8f9fc", fontSize: "0.7rem", color: "#6c757d" }}
              >
                {qrCode}
              </div>
            </>
          ) : (
            <div className="py-3">
              <i className="bi bi-exclamation-triangle-fill fs-3 text-warning d-block mb-2"></i>
              <p className="text-muted mb-0">
                {isArabic
                  ? "لا يتوفر رمز QR. تأكد أن الجلسة نشطة."
                  : "QR code not available. Make sure the session is active."}
              </p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 justify-content-center">
          <Button variant="outline-secondary" onClick={handleCloseQr} style={{ minHeight: "44px" }}>
            {isArabic ? "إغلاق" : "Close"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InstructorAttendance;
