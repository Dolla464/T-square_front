import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  Badge,
  Card,
  Col,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useStudentAttendance } from "../../hooks/useStudentAttendance";
import StatCard from "../../components/StatCard";
import "../../styles/dashboardShared.css";
import "./StudentAttendance.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_CONFIG = {
  present: { bg: "#e6f4ea", color: "#137333", icon: "bi-check-circle-fill" },
  absent: { bg: "#fce8e6", color: "#c5221f", icon: "bi-x-circle-fill" },
  late: { bg: "#fef7e0", color: "#b06000", icon: "bi-clock-fill" },
  not_marked: { bg: "#f1f3f4", color: "#3c4043", icon: "bi-dash-circle" },
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
      className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <i className={`bi ${cfg.icon}`} />
      {labels[status] ?? labels.not_marked}
    </span>
  );
}

// ── QR Camera Scanner ─────────────────────────────────────────────────────────
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
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  useEffect(() => { onScanRef.current = onScan; }, [onScan]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    const containerId = "student-qr-scan-box";
    let active = true;
    let scanner = null;
    let startPromise = null;

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
      qrCleanupPromise = Promise.resolve(startPromise)
        .catch(() => {})
        .then(() => (s ? stopScanner(s) : undefined));
    };
  }, []);

  return (
    <div className="text-center">
      <div
        id="student-qr-scan-box"
        ref={containerRef}
        style={{ width: "100%", maxWidth: 300, margin: "0 auto", borderRadius: "12px", overflow: "hidden" }}
      />
      <p className="small text-muted mt-3 mb-0">
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
      setTimeout(() => {
        setActiveTab("today");
        setScanMode("show_qr");
      }, 0);
    }

    setSearchParams({}, { replace: true });
  }, [loading, searchParams, selectSession, setSearchParams, todaySessions]);

  useEffect(() => {
    if (summary.length > 0 && !selectedGroupId) {
      setTimeout(() => {
        setSelectedGroupId(summary[0].group_id);
        selectGroup(summary[0].group_id);
      }, 0);
    }
  }, [summary, selectedGroupId, selectGroup]);

  const handleGroupChange = (groupId) => {
    setSelectedGroupId(Number(groupId));
    selectGroup(Number(groupId));
  };

  // ── Calculate overall stats from summary ──
  const overallStats = useMemo(() => {
    if (!summary || summary.length === 0) {
      return { pct: 0, present: 0, absent: 0, total: 0 };
    }
    let present = 0;
    let total = 0;
    summary.forEach((g) => {
      present += g.attended_sessions ?? 0;
      total += g.total_sessions ?? 0;
    });
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    const absent = Math.max(0, total - present);
    return { pct, present, absent, total };
  }, [summary]);

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
      {/* عنوان الصفحة للموبايل */}
      <h4 className="dash-page-title d-md-none d-block mb-1">
        {t("attendance.title")}
      </h4>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-2 d-md-none d-flex">
        <p className="text-muted mb-0 small">{todayLabel}</p>
      </div>

      {/* ── KPI StatCards Section ── */}
      <div className="stats-grid">
        <StatCard
          icon="bi-percent"
          iconBg="#fff0f0"
          iconColor="#be1522"
          value={`${overallStats.pct}%`}
          label={t("stats.attendance_rate", "Attendance Rate")}
        />
        <StatCard
          icon="bi-check2-circle"
          iconBg="#efffef"
          iconColor="#22c55e"
          value={overallStats.present}
          label={t("stats.present_sessions", "Present")}
        />
        <StatCard
          icon="bi-x-circle"
          iconBg="#fff5f5"
          iconColor="#ff4d4f"
          value={overallStats.absent}
          label={t("stats.absent_sessions", "Absent")}
        />
        <StatCard
          icon="bi-journals"
          iconBg="#eef3ff"
          iconColor="#4a6cf7"
          value={overallStats.total}
          label={t("stats.total_sessions", "Total Sessions")}
        />
      </div>

      {/* ── Toolbar with tabs & refresh ── */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-2">
        <div className="filter-tabs">
          {[
            { key: "today", icon: "bi-calendar-event" },
            { key: "schedule", icon: "bi-calendar3" },
            { key: "history", icon: "bi-clock-history" },
          ].map(({ key, icon }) => (
            <button
              key={key}
              className={`filter-tab ${activeTab === key ? "filter-tab-active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <i className={`bi ${icon} me-1`}></i>
              {t(`attendance.tabs.${key}`)}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-outline-danger d-flex align-items-center gap-2"
          style={{ borderRadius: "10px", padding: "8px 16px", fontSize: "0.85rem", fontWeight: 600 }}
          onClick={() => loadToday()}
        >
          <i className="bi bi-arrow-clockwise" />
          {t("attendance.refresh")}
        </button>
      </div>

      {loading && activeTab === "today" ? (
        <div className="dash-loading">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : null}

      {activeTab === "today" && !loading ? (
        <Row className="g-4">
          {/* Today's sessions card */}
          <Col lg={5}>
            <Card>
              <Card.Body>
                <h6 className="section-title mb-3">{t("attendance.todaySessions")}</h6>
                {todaySessions.length === 0 ? (
                  <div className="py-4 text-center text-muted">
                    <i className="bi bi-calendar-x fs-2 d-block mb-2 text-muted" style={{ opacity: 0.5 }} />
                    <p className="mb-0 small">{t("attendance.noSessionsToday")}</p>
                  </div>
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
                            <strong className="d-block text-dark" style={{ fontSize: "0.92rem" }}>
                              {session.course_title}
                            </strong>
                            <span className="small text-muted d-block mt-1">{session.group_name}</span>
                            <span className="small text-muted d-block mt-1">
                              <i className="bi bi-clock me-1" />
                              {session.start_time} – {session.end_time}
                              {session.room ? ` · Room ${session.room}` : ""}
                            </span>
                          </div>
                          <div className="d-flex flex-column align-items-end gap-2">
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

          {/* QR Scan card */}
          <Col lg={7}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center min-h-350 py-5">
                <h6 className="section-title mb-3 align-self-start">{t("attendance.qrTitle")}</h6>

                {!activeSession ? (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-arrow-left-right fs-1 d-block mb-3 text-muted" style={{ opacity: 0.4 }} />
                    <p className="mb-0">{t("attendance.selectSession")}</p>
                  </div>
                ) : activeSession.student_status === "present" ||
                  activeSession.student_status === "late" ? (
                  <div className="py-4 text-center">
                    <i className="bi bi-check-circle-fill text-success fs-1 mb-3 d-block" />
                    <StatusBadge status={activeSession.student_status} isArabic={isArabic} />
                    <p className="text-muted mt-3 mb-0 fw-semibold">{t("attendance.alreadyMarked")}</p>
                  </div>
                ) : activeSession.status !== "active" ? (
                  <div className="py-4 text-center text-muted">
                    <i className="bi bi-lock-fill fs-2 d-block mb-2 text-warning" style={{ opacity: 0.7 }} />
                    <p className="mb-0">{t("attendance.sessionNotActive")}</p>
                  </div>
                ) : !activeSession.qr_available ? (
                  <div className="py-4 text-center">
                    <i className="bi bi-clock-history fs-2 text-muted mb-2 d-block" style={{ opacity: 0.5 }} />
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
                  <div className="w-100 text-center">
                    {/* Mode toggles */}
                    <div className="btn-group mb-4" role="group" style={{ borderRadius: "10px", overflow: "hidden" }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${scanMode === "show_qr" ? "btn-danger" : "btn-outline-danger"}`}
                        style={{ padding: "8px 18px", fontWeight: 600 }}
                        onClick={() => handleScanModeSwitch("show_qr")}
                      >
                        <i className="bi bi-qr-code me-1" />
                        {t("attendance.showQr")}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${scanMode === "scan_qr" ? "btn-danger" : "btn-outline-danger"}`}
                        style={{ padding: "8px 18px", fontWeight: 600 }}
                        onClick={() => handleScanModeSwitch("scan_qr")}
                      >
                        <i className="bi bi-camera me-1" />
                        {t("attendance.scanQr")}
                      </button>
                    </div>

                    {/* Show My QR */}
                    {scanMode === "show_qr" && (
                      <div className="d-flex flex-column align-items-center">
                        {qrLoading ? (
                          <div className="py-5">
                            <Spinner animation="border" variant="danger" />
                          </div>
                        ) : qrCode ? (
                          <div className="student-qr-wrap">
                            <div className="p-3 bg-white rounded-3 shadow-sm border">
                              <QRCodeSVG value={qrCode} size={200} level="M" includeMargin />
                            </div>
                            <p className="small text-muted mt-3 mb-2">{t("attendance.qrHint")}</p>
                            {qrExpiresAt ? (
                              <small className="text-muted d-block mb-3">
                                {t("attendance.qrExpires", {
                                  time: new Date(qrExpiresAt).toLocaleTimeString(
                                    isArabic ? "ar-EG" : "en-US",
                                  ),
                                })}
                              </small>
                            ) : null}
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              style={{ borderRadius: "8px", fontWeight: 600 }}
                              onClick={() => loadQrCode(activeSession.session_id)}
                            >
                              {t("attendance.refreshQr")}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-danger btn-lg px-4"
                            style={{ borderRadius: "10px", fontWeight: 600, fontSize: "0.95rem" }}
                            onClick={() => loadQrCode(activeSession.session_id)}
                          >
                            {t("attendance.generateQr")}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Scan Session QR */}
                    {scanMode === "scan_qr" && (
                      <div className="w-100">
                        {checkInSuccess ? (
                          <div className="py-4 text-center">
                            <i className="bi bi-check-circle-fill text-success fs-1 mb-3 d-block" />
                            <p className="fw-semibold text-success mb-1">
                              {t("attendance.checkInSuccess")}
                            </p>
                          </div>
                        ) : checkInLoading ? (
                          <div className="py-5 text-center">
                            <Spinner animation="border" variant="danger" />
                            <p className="text-muted small mt-3 mb-0">
                              {t("attendance.scanning")}
                            </p>
                          </div>
                        ) : cameraError ? (
                          <div className="py-4 text-center">
                            <i className="bi bi-camera-video-off fs-1 text-danger mb-3 d-block" />
                            <div className="alert alert-danger py-2 mb-3 small" role="alert" style={{ borderRadius: "10px" }}>
                              <i className="bi bi-exclamation-triangle me-1" />
                              {cameraError}
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              style={{ borderRadius: "8px", fontWeight: 600 }}
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
                          <div className="w-100">
                            {checkInError && (
                              <div className="alert alert-danger py-2 mb-3 small" role="alert" style={{ borderRadius: "10px" }}>
                                <i className="bi bi-exclamation-triangle me-1" />
                                {checkInError}
                              </div>
                            )}
                            <QrScannerWidget
                              onScan={handleCheckIn}
                              onError={handleCameraError}
                              isArabic={isArabic}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : null}

      {/* ── Schedule Tab ── */}
      {activeTab === "schedule" ? (
        <Card>
          <Card.Body>
            <h6 className="section-title mb-3">{t("attendance.upcomingSchedule")}</h6>
            {schedule.length === 0 ? (
              <div className="py-5 text-center text-muted">
                <i className="bi bi-calendar-check fs-2 text-muted mb-2 d-block" style={{ opacity: 0.5 }} />
                <p className="mb-0 small">{t("attendance.noUpcoming")}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table responsive hover className="align-middle mb-0 text-center">
                  <thead>
                    <tr>
                      <th className="text-start">{t("attendance.course")}</th>
                      <th>{t("attendance.date")}</th>
                      <th>{t("attendance.time")}</th>
                      <th>{t("attendance.room")}</th>
                      <th>{t("attendance.session")}</th>
                      <th>{t("attendance.yourStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item) => (
                      <tr key={item.session_id}>
                        <td className="text-start">
                          <strong className="d-block text-dark" style={{ fontSize: "0.9rem" }}>{item.course_title}</strong>
                          <small className="text-muted">{item.group_name}</small>
                        </td>
                        <td>{item.session_date}</td>
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
              </div>
            )}
          </Card.Body>
        </Card>
      ) : null}

      {/* ── History Tab ── */}
      {activeTab === "history" ? (
        <Row className="g-4">
          {/* Groups list */}
          <Col lg={4}>
            <Card>
              <Card.Body>
                <h6 className="section-title mb-3">{t("attendance.myGroups")}</h6>
                {summary.length === 0 ? (
                  <div className="py-4 text-center text-muted">
                    <i className="bi bi-journals fs-2 text-muted mb-2 d-block" style={{ opacity: 0.5 }} />
                    <p className="mb-0 small">{t("attendance.noGroups")}</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {summary.map((group) => (
                      <button
                        key={group.group_id}
                        type="button"
                        className={`student-session-card ${selectedGroupId === group.group_id ? "active" : ""}`}
                        onClick={() => handleGroupChange(group.group_id)}
                      >
                        <strong className="d-block text-dark" style={{ fontSize: "0.92rem" }}>{group.course_title}</strong>
                        <span className="small text-muted d-block mt-1">{group.group_name}</span>
                        <ProgressBar
                          now={group.attendance_percentage}
                          variant="danger"
                          className="mt-3 mb-1"
                          style={{ height: 6 }}
                        />
                        <div className="d-flex justify-content-between align-items-center small text-muted mt-1">
                          <span>{group.attendance_percentage}%</span>
                          <span>
                            {group.attended_sessions}/{group.total_sessions}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Group details & list */}
          <Col lg={8}>
            <Card>
              <Card.Body>
                {historyLoading ? (
                  <div className="dash-loading">
                    <Spinner animation="border" variant="danger" />
                  </div>
                ) : !groupHistory ? (
                  <div className="py-5 text-center text-muted">
                    <i className="bi bi-collection-play fs-2 text-muted mb-2 d-block" style={{ opacity: 0.5 }} />
                    <p className="mb-0">{t("attendance.selectGroup")}</p>
                  </div>
                ) : (
                  <>
                    <Row className="align-items-center mb-4 g-3">
                      <Col md={5} className="text-center">
                        <div style={{ maxWidth: 160, margin: "0 auto" }}>
                          <Doughnut data={chartData} />
                        </div>
                      </Col>
                      <Col md={7} className={isArabic ? "text-end" : "text-start"}>
                        <h5 className="fw-bold mb-1">{groupHistory.course_title}</h5>
                        <p className="text-muted mb-3 small">{groupHistory.group_name}</p>
                        <div className="display-6 fw-bold text-danger mb-2" style={{ color: "#be1522" }}>
                          {groupHistory.attendance_percentage}%
                        </div>
                        <p className="text-muted small mb-0">
                          {groupHistory.attended_sessions} / {groupHistory.total_sessions}{" "}
                          {t("attendance.sessionsAttended")}
                        </p>
                      </Col>
                    </Row>

                    <div className="table-responsive">
                      <Table responsive hover className="align-middle mb-0 text-center">
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
                    </div>
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
