import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  Badge,
  Card,
  Col,
  Nav,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useStudentAttendance } from "../../hooks/useStudentAttendance";
import "../../styles/dashboardShared.css";
import "./StudentAttendance.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_CONFIG = {
  present: { bg: "#d1e7dd", color: "#0f5132", icon: "bi-check-circle-fill" },
  absent: { bg: "#f8d7da", color: "#842029", icon: "bi-x-circle-fill" },
  late: { bg: "#fff3cd", color: "#664d03", icon: "bi-clock-fill" },
  not_marked: { bg: "#e2e3e5", color: "#41464b", icon: "bi-dash-circle" },
};

const SESSION_STATUS = {
  upcoming: "secondary",
  active: "success",
  completed: "danger",
  cancelled: "dark",
};

function StatusBadge({ status, isArabic }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_marked;
  const labels = {
    present: isArabic ? "حاضر" : "Present",
    absent: isArabic ? "غائب" : "Absent",
    late: isArabic ? "متأخر" : "Late",
    not_marked: isArabic ? "لم يسجَّل" : "Not Marked",
  };

  return (
    <span
      className="badge rounded-pill px-3 py-2"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <i className={`bi ${cfg.icon} me-1`} />
      {labels[status] ?? labels.not_marked}
    </span>
  );
}

// ── QR Camera Scanner ─────────────────────────────────────────────────────────
// Tracks cleanup across React StrictMode double-invoke so a new scanner never
// tries to open the camera while the previous one is still releasing it.
let qrCleanupPromise = Promise.resolve();

function stopScanner(scanner) {
  return new Promise((resolve) => {
    try {
      scanner.stop().catch(() => {}).finally(resolve);
    } catch {
      resolve();
    }
  });
}

function QrScannerWidget({ onScan, onError, isArabic }) {
  const containerRef = useRef(null);
  // Keep latest callbacks in refs so the effect never needs to restart when
  // the parent re-renders and passes new function references.
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  useEffect(() => { onScanRef.current = onScan; }, [onScan]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    const containerId = "student-qr-scan-box";
    let active = true;
    let scanner = null;
    let startPromise = null;

    // Capture the previous cleanup so we can wait for it before opening camera.
    const previousCleanup = qrCleanupPromise;

    const run = async () => {
      await previousCleanup;
      if (!active || !containerRef.current) return;

      const { Html5Qrcode } = await import("html5-qrcode");
      if (!active || !containerRef.current) return;

      scanner = new Html5Qrcode(containerId);

      startPromise = scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (decodedText.startsWith("sess_")) {
            stopScanner(scanner);
            onScanRef.current(decodedText);
          }
        },
        () => {},
      );

      try {
        await startPromise;
      } catch (err) {
        if (active) onErrorRef.current(err instanceof Error ? err : new Error(String(err)));
      }
    };

    run();

    return () => {
      active = false;
      const s = scanner;
      scanner = null;
      // Publish this cleanup so the next effect waits for the camera to be free.
      qrCleanupPromise = Promise.resolve(startPromise)
        .catch(() => {})
        .then(() => (s ? stopScanner(s) : undefined));
    };
  }, []); // stable — callbacks are accessed via refs above

  return (
    <div className="text-center">
      <div
        id="student-qr-scan-box"
        ref={containerRef}
        style={{ width: "100%", maxWidth: 300, margin: "0 auto" }}
      />
      <p className="small text-muted mt-2 mb-0">
        {isArabic
          ? "وجّه الكاميرا نحو رمز QR الذي يعرضه المدرب."
          : "Point your camera at the QR code displayed by the instructor."}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentAttendance() {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("today");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [scanMode, setScanMode] = useState("show_qr");
  const [cameraError, setCameraError] = useState(null);

  const {
    summary,
    todaySessions,
    schedule,
    groupHistory,
    activeSession,
    qrCode,
    qrExpiresAt,
    loading,
    qrLoading,
    historyLoading,
    checkInLoading,
    checkInSuccess,
    checkInError,
    loadToday,
    loadQrCode,
    handleCheckIn,
    resetCheckIn,
    selectSession,
    selectGroup,
  } = useStudentAttendance();

  const handleScanModeSwitch = (mode) => {
    setScanMode(mode);
    setCameraError(null);
    resetCheckIn();
  };

  const handleCameraError = useCallback((err) => {
    const raw = (err?.message ?? String(err ?? "")).toLowerCase();
    const isPermission = raw.includes("permission") || raw.includes("denied") || raw.includes("notallowed");
    const msg = isPermission
      ? isArabic
        ? "تم رفض إذن الكاميرا. يرجى السماح بالوصول إليها من إعدادات المتصفح."
        : "Camera permission denied. Please allow camera access in your browser settings."
      : isArabic
        ? "تعذّر فتح الكاميرا. تأكد من أنها غير مستخدمة من تطبيق آخر وأعد المحاولة."
        : "Could not open camera. Make sure it is not in use by another app and try again.";
    setCameraError(msg);
  }, [isArabic]);

  useEffect(() => {
    const sessionId = searchParams.get("session");
    if (!sessionId || loading || todaySessions.length === 0) return;

    const matched = todaySessions.find(
      (s) => String(s.session_id) === String(sessionId),
    );

    if (matched) {
      selectSession(matched);
      setActiveTab("today");
      setScanMode("show_qr");
    }

    setSearchParams({}, { replace: true });
  }, [loading, searchParams, selectSession, setSearchParams, todaySessions]);

  useEffect(() => {
    if (summary.length > 0 && !selectedGroupId) {
      setSelectedGroupId(summary[0].group_id);
      selectGroup(summary[0].group_id);
    }
  }, [summary, selectedGroupId, selectGroup]);

  const handleGroupChange = (groupId) => {
    setSelectedGroupId(Number(groupId));
    selectGroup(Number(groupId));
  };

  const chartData = {
    labels: [t("attendance.attended"), t("attendance.remaining")],
    datasets: [
      {
        data: [
          groupHistory?.attendance_percentage ?? 0,
          100 - (groupHistory?.attendance_percentage ?? 0),
        ],
        backgroundColor: ["#be1522", "#e9ecef"],
        borderWidth: 0,
      },
    ],
  };

  const todayLabel = new Date().toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="student-attendance-page" dir={isArabic ? "rtl" : "ltr"}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="dash-page-title mb-1">{t("attendance.title")}</h4>
          <p className="text-muted mb-0">{todayLabel}</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => loadToday()}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          {t("attendance.refresh")}
        </button>
      </div>

      <Nav variant="tabs" className="student-attendance-tabs mb-4">
        {["today", "schedule", "history"].map((tab) => (
          <Nav.Item key={tab}>
            <Nav.Link
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "active" : ""}
            >
              {t(`attendance.tabs.${tab}`)}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {loading && activeTab === "today" ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : null}

      {activeTab === "today" && !loading ? (
        <Row className="g-4">
          <Col lg={5}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h5 className="mb-3">{t("attendance.todaySessions")}</h5>
                {todaySessions.length === 0 ? (
                  <p className="text-muted mb-0">{t("attendance.noSessionsToday")}</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {todaySessions.map((session) => (
                      <button
                        key={session.session_id}
                        type="button"
                        className={`student-session-card ${activeSession?.session_id === session.session_id ? "active" : ""}`}
                        onClick={() => selectSession(session)}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div className="text-start">
                            <strong>{session.course_title}</strong>
                            <div className="small text-muted">{session.group_name}</div>
                            <div className="small">
                              {session.start_time} – {session.end_time}
                              {session.room ? ` · ${session.room}` : ""}
                            </div>
                          </div>
                          <div className="d-flex flex-column align-items-end gap-1">
                            <Badge bg={SESSION_STATUS[session.status] ?? "secondary"}>
                              {t(`attendance.sessionStatus.${session.status}`, session.status)}
                            </Badge>
                            <StatusBadge status={session.student_status} isArabic={isArabic} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <h5 className="mb-3">{t("attendance.qrTitle")}</h5>

                {!activeSession ? (
                  <p className="text-muted">{t("attendance.selectSession")}</p>
                ) : activeSession.student_status === "present" ||
                  activeSession.student_status === "late" ? (
                  <div className="py-4">
                    <i className="bi bi-check-circle-fill text-success fs-1 mb-3 d-block" />
                    <StatusBadge status={activeSession.student_status} isArabic={isArabic} />
                    <p className="text-muted mt-3 mb-0">{t("attendance.alreadyMarked")}</p>
                  </div>
                ) : activeSession.status !== "active" ? (
                  <p className="text-muted py-4">{t("attendance.sessionNotActive")}</p>
                ) : !activeSession.qr_available ? (
                  <div className="py-4">
                    <p className="text-muted mb-2">{t("attendance.qrNotAvailable")}</p>
                    {activeSession.qr_window ? (
                      <small className="text-muted">
                        {t("attendance.qrWindow", {
                          start: activeSession.qr_window.start,
                          end: activeSession.qr_window.end,
                        })}
                      </small>
                    ) : null}
                  </div>
                ) : (
                  <>
                    {/* ── Mode toggle ── */}
                    <div className="btn-group mb-4" role="group">
                      <button
                        type="button"
                        className={`btn btn-sm ${scanMode === "show_qr" ? "btn-danger" : "btn-outline-danger"}`}
                        onClick={() => handleScanModeSwitch("show_qr")}
                      >
                        <i className="bi bi-qr-code me-1" />
                        {t("attendance.showQr")}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${scanMode === "scan_qr" ? "btn-danger" : "btn-outline-danger"}`}
                        onClick={() => handleScanModeSwitch("scan_qr")}
                      >
                        <i className="bi bi-camera me-1" />
                        {t("attendance.scanQr")}
                      </button>
                    </div>

                    {/* ── Show My QR (att_*) ── */}
                    {scanMode === "show_qr" && (
                      <>
                        {qrLoading ? (
                          <div className="py-5">
                            <Spinner animation="border" variant="danger" />
                          </div>
                        ) : qrCode ? (
                          <div className="student-qr-wrap">
                            <QRCodeSVG value={qrCode} size={220} level="M" includeMargin />
                            <p className="small text-muted mt-3 mb-2">{t("attendance.qrHint")}</p>
                            {qrExpiresAt ? (
                              <small className="text-muted d-block">
                                {t("attendance.qrExpires", {
                                  time: new Date(qrExpiresAt).toLocaleTimeString(
                                    isArabic ? "ar-EG" : "en-US",
                                  ),
                                })}
                              </small>
                            ) : null}
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm mt-3"
                              onClick={() => loadQrCode(activeSession.session_id)}
                            >
                              {t("attendance.refreshQr")}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => loadQrCode(activeSession.session_id)}
                          >
                            {t("attendance.generateQr")}
                          </button>
                        )}
                      </>
                    )}

                    {/* ── Scan Session QR (sess_*) ── */}
                    {scanMode === "scan_qr" && (
                      <>
                        {checkInSuccess ? (
                          <div className="py-4">
                            <i className="bi bi-check-circle-fill text-success fs-1 mb-3 d-block" />
                            <p className="fw-semibold text-success mb-1">
                              {t("attendance.checkInSuccess")}
                            </p>
                          </div>
                        ) : checkInLoading ? (
                          <div className="py-5">
                            <Spinner animation="border" variant="danger" />
                            <p className="text-muted small mt-2 mb-0">
                              {t("attendance.scanning")}
                            </p>
                          </div>
                        ) : cameraError ? (
                          <div className="py-4">
                            <i className="bi bi-camera-video-off fs-1 text-danger mb-3 d-block" />
                            <div className="alert alert-danger py-2 mb-3 small" role="alert">
                              <i className="bi bi-exclamation-triangle me-1" />
                              {cameraError}
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => {
                                setCameraError(null);
                                resetCheckIn();
                              }}
                            >
                              <i className="bi bi-arrow-clockwise me-1" />
                              {isArabic ? "إعادة المحاولة" : "Retry"}
                            </button>
                          </div>
                        ) : (
                          <>
                            {checkInError && (
                              <div className="alert alert-danger py-2 mb-3 small" role="alert">
                                <i className="bi bi-exclamation-triangle me-1" />
                                {checkInError}
                              </div>
                            )}
                            <QrScannerWidget
                              onScan={handleCheckIn}
                              onError={handleCameraError}
                              isArabic={isArabic}
                            />
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : null}

      {activeTab === "schedule" ? (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <h5 className="mb-3">{t("attendance.upcomingSchedule")}</h5>
            {schedule.length === 0 ? (
              <p className="text-muted mb-0">{t("attendance.noUpcoming")}</p>
            ) : (
              <Table responsive hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>{t("attendance.date")}</th>
                    <th>{t("attendance.course")}</th>
                    <th>{t("attendance.time")}</th>
                    <th>{t("attendance.room")}</th>
                    <th>{t("attendance.session")}</th>
                    <th>{t("attendance.yourStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item) => (
                    <tr key={item.session_id}>
                      <td>{item.session_date}</td>
                      <td>
                        <div>{item.course_title}</div>
                        <small className="text-muted">{item.group_name}</small>
                      </td>
                      <td>
                        {item.start_time} – {item.end_time}
                      </td>
                      <td>{item.room || "—"}</td>
                      <td>
                        <Badge bg={SESSION_STATUS[item.status] ?? "secondary"}>
                          {t(`attendance.sessionStatus.${item.status}`, item.status)}
                        </Badge>
                      </td>
                      <td>
                        <StatusBadge status={item.student_status} isArabic={isArabic} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      ) : null}

      {activeTab === "history" ? (
        <Row className="g-4">
          <Col lg={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">{t("attendance.myGroups")}</h5>
                {summary.length === 0 ? (
                  <p className="text-muted mb-0">{t("attendance.noGroups")}</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {summary.map((group) => (
                      <button
                        key={group.group_id}
                        type="button"
                        className={`student-session-card ${selectedGroupId === group.group_id ? "active" : ""}`}
                        onClick={() => handleGroupChange(group.group_id)}
                      >
                        <strong>{group.course_title}</strong>
                        <div className="small text-muted">{group.group_name}</div>
                        <ProgressBar
                          now={group.attendance_percentage}
                          variant="danger"
                          className="mt-2"
                          style={{ height: 8 }}
                        />
                        <small className="text-muted">
                          {group.attendance_percentage}% · {group.attended_sessions}/
                          {group.total_sessions}
                        </small>
                      </button>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                {historyLoading ? (
                  <div className="d-flex justify-content-center py-5">
                    <Spinner animation="border" variant="danger" />
                  </div>
                ) : !groupHistory ? (
                  <p className="text-muted mb-0">{t("attendance.selectGroup")}</p>
                ) : (
                  <>
                    <Row className="align-items-center mb-4">
                      <Col md={5} className="text-center">
                        <div style={{ maxWidth: 180, margin: "0 auto" }}>
                          <Doughnut data={chartData} />
                        </div>
                      </Col>
                      <Col md={7}>
                        <h5>{groupHistory.course_title}</h5>
                        <p className="text-muted mb-2">{groupHistory.group_name}</p>
                        <div className="display-6 fw-bold text-danger">
                          {groupHistory.attendance_percentage}%
                        </div>
                        <small className="text-muted">
                          {groupHistory.attended_sessions} / {groupHistory.total_sessions}{" "}
                          {t("attendance.sessionsAttended")}
                        </small>
                      </Col>
                    </Row>

                    <Table responsive hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>{t("attendance.date")}</th>
                          <th>{t("attendance.time")}</th>
                          <th>{t("attendance.session")}</th>
                          <th>{t("attendance.yourStatus")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(groupHistory.sessions ?? []).map((session) => (
                          <tr key={session.session_id}>
                            <td>{session.session_date}</td>
                            <td>
                              {session.start_time} – {session.end_time}
                            </td>
                            <td>
                              <Badge bg={SESSION_STATUS[session.session_status] ?? "secondary"}>
                                {t(
                                  `attendance.sessionStatus.${session.session_status}`,
                                  session.session_status,
                                )}
                              </Badge>
                            </td>
                            <td>
                              <StatusBadge status={session.status} isArabic={isArabic} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : null}
    </div>
  );
}

export default StudentAttendance;
