import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, Spinner } from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import { useAttendanceToday } from "../../hooks/useAttendanceToday";
import SessionCard from "./components/SessionCard";
import StatusBadge from "./components/StatusBadge";
import QrScannerWidget from "./components/QrScannerWidget";
import SessionStatusBadge from "../../../../components/shared/SessionStatusBadge/SessionStatusBadge";
import {
  canCheckInToday,
  getTodayHeroMessageKey,
  isAttended,
  isFinalizedAbsent,
} from "./utils/todaySessionState";
import "../../styles/dashboardShared.css";
import "./StudentAttendance.css";
import { isArabicLocale } from "../../../../utils/isArabicLocale";

function AttendanceToday() {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = isArabicLocale(i18n.language);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showOthers, setShowOthers] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [scanMode, setScanMode] = useState("show_qr");
  const [cameraError, setCameraError] = useState(null);

  const {
    todaySessions,
    activeSession,
    qrCode,
    qrExpiresAt,
    loading,
    qrLoading,
    checkInLoading,
    checkInSuccess,
    checkInError,
    loadToday,
    loadQrCode,
    handleCheckIn,
    resetCheckIn,
    selectSession,
  } = useAttendanceToday();

  const otherSessions = useMemo(
    () =>
      todaySessions.filter(
        (session) => session.session_id !== activeSession?.session_id,
      ),
    [todaySessions, activeSession?.session_id],
  );

  const canCheckIn = canCheckInToday(activeSession);
  const isAlreadyMarked = isAttended(activeSession);
  const isAbsentFinalized = isFinalizedAbsent(activeSession);

  const handleScanModeSwitch = (mode) => {
    setScanMode(mode);
    setCameraError(null);
    resetCheckIn();
  };

  const handleCameraError = useCallback(
    (err) => {
      const raw = (err?.message ?? String(err ?? "")).toLowerCase();
      const isPermission =
        raw.includes("permission") ||
        raw.includes("denied") ||
        raw.includes("notallowed");
      const msg = isPermission
        ? t("attendance.cameraPermissionDenied")
        : t("attendance.cameraUnavailable");
      setCameraError(msg);
    },
    [t],
  );

  useEffect(() => {
    const sessionId = searchParams.get("session");
    if (!sessionId || loading || todaySessions.length === 0) return;

    const matched = todaySessions.find(
      (session) => String(session.session_id) === String(sessionId),
    );

    if (matched) {
      selectSession(matched);
      setCheckInOpen(true);
      setScanMode("show_qr");
    }

    setSearchParams({}, { replace: true });
  }, [loading, searchParams, selectSession, setSearchParams, todaySessions]);

  const todayLabel = new Date().toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const heroStatusMessage = () => {
    const messageKey = getTodayHeroMessageKey(activeSession);

    if (messageKey === "attendance.qrWindow" && activeSession?.qr_window) {
      return t(messageKey, {
        start: activeSession.qr_window.start,
        end: activeSession.qr_window.end,
      });
    }

    return t(messageKey);
  };

  return (
    <div className="student-attendance-page" dir={isArabic ? "rtl" : "ltr"}>
      <div className="attendance-page-header">
        <div>
          <h4 className="dash-page-title mb-1">{t("attendance.nav.today")}</h4>
          <p className="text-muted mb-0 small">{todayLabel}</p>
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

      {loading ? (
        <div className="dash-loading">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : (
        <>
          <Card className="attendance-hero-card">
            <Card.Body className="p-4">
              {!activeSession ? (
                <div className="py-4 text-center text-muted">
                  <i className="bi bi-calendar-x fs-2 d-block mb-2" style={{ opacity: 0.5 }} />
                  <p className="mb-0">{t("attendance.noSessionsToday")}</p>
                </div>
              ) : (
                <>
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <span className="attendance-hero-label">{t("attendance.heroSession")}</span>
                      <h5 className="fw-bold mb-1">{activeSession.course_title}</h5>
                      <p className="text-muted mb-2 small">{activeSession.group_name}</p>
                      <p className="text-muted mb-0 small">
                        <i className="bi bi-clock me-1" />
                        {activeSession.start_time} – {activeSession.end_time}
                        {activeSession.room
                          ? ` · ${t("attendance.room_prefix")} ${activeSession.room}`
                          : ""}
                      </p>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-2">
                      <SessionStatusBadge status={activeSession.status} isArabic={isArabic} />
                      <StatusBadge status={activeSession.student_status} compact />
                    </div>
                  </div>

                  <p className="attendance-hero-status mb-3">{heroStatusMessage()}</p>

                  {canCheckIn && !checkInOpen ? (
                    <button
                      type="button"
                      className="btn btn-danger btn-lg w-100 attendance-check-in-btn"
                      onClick={() => {
                        setCheckInOpen(true);
                        setScanMode("show_qr");
                      }}
                    >
                      <i className="bi bi-qr-code-scan me-2" />
                      {t("attendance.checkInNow")}
                    </button>
                  ) : null}

                  {isAlreadyMarked ? (
                    <div className="text-center py-2">
                      <i className="bi bi-check-circle-fill text-success fs-2 mb-2 d-block" />
                      <StatusBadge status={activeSession.student_status} />
                    </div>
                  ) : null}

                  {isAbsentFinalized ? (
                    <div className="text-center py-2">
                      <i className="bi bi-x-circle-fill text-danger fs-2 mb-2 d-block" />
                      <StatusBadge status="absent" />
                    </div>
                  ) : null}
                </>
              )}
            </Card.Body>
          </Card>

          {checkInOpen && canCheckIn ? (
            <Card>
              <Card.Body className="p-4 attendance-qr-panel">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="section-title mb-0">{t("attendance.qrTitle")}</h6>
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-muted text-decoration-none"
                    onClick={() => setCheckInOpen(false)}
                  >
                    {t("attendance.closeCheckIn")}
                  </button>
                </div>

                {scanMode === "show_qr" ? (
                  <div className="d-flex flex-column align-items-center text-center">
                    {qrLoading ? (
                      <div className="py-5">
                        <Spinner animation="border" variant="danger" />
                      </div>
                    ) : qrCode ? (
                      <div className="student-qr-wrap">
                        <div className="p-3 bg-white rounded-3 shadow-sm border">
                          <QRCodeSVG value={qrCode} size={220} level="M" includeMargin />
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
                        style={{ borderRadius: "10px", fontWeight: 600 }}
                        onClick={() => loadQrCode(activeSession.session_id)}
                      >
                        {t("attendance.generateQr")}
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-link attendance-scan-link mt-3"
                      onClick={() => handleScanModeSwitch("scan_qr")}
                    >
                      {t("attendance.useScanInstead")}
                    </button>
                  </div>
                ) : (
                  <div className="w-100 text-center">
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
                        <p className="text-muted small mt-3 mb-0">{t("attendance.scanning")}</p>
                      </div>
                    ) : cameraError ? (
                      <div className="py-4">
                        <div className="alert alert-danger py-2 mb-3 small" role="alert">
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
                          {t("attendance.retryCamera")}
                        </button>
                      </div>
                    ) : (
                      <>
                        <QrScannerWidget
                          onScan={handleCheckIn}
                          onError={handleCameraError}
                          isArabic={isArabic}
                        />
                        {checkInError ? (
                          <div className="alert alert-danger py-2 mt-3 mb-0 small" role="alert">
                            {checkInError}
                          </div>
                        ) : null}
                      </>
                    )}

                    <button
                      type="button"
                      className="btn btn-link attendance-scan-link mt-3"
                      onClick={() => handleScanModeSwitch("show_qr")}
                    >
                      {t("attendance.useShowQrInstead")}
                    </button>
                  </div>
                )}
              </Card.Body>
            </Card>
          ) : null}

          {otherSessions.length > 0 ? (
            <Card>
              <Card.Body>
                <button
                  type="button"
                  className="btn btn-link attendance-others-toggle p-0 text-decoration-none"
                  onClick={() => setShowOthers((prev) => !prev)}
                >
                  <i className={`bi bi-chevron-${showOthers ? "up" : "down"} me-1`} />
                  {t("attendance.moreSessionsToday", { count: otherSessions.length })}
                </button>

                {showOthers ? (
                  <div className="d-flex flex-column gap-2 mt-3">
                    {otherSessions.map((session) => (
                      <SessionCard
                        key={session.session_id}
                        session={session}
                        isActive={false}
                        isArabic={isArabic}
                        compact
                        onSelect={(item) => {
                          selectSession(item);
                          setCheckInOpen(false);
                          setScanMode("show_qr");
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </Card.Body>
            </Card>
          ) : null}

          <div className="text-center">
            <Link to="/student/attendance/history" className="attendance-history-link">
              {t("attendance.viewMyRecord")}
              <i className={`bi bi-arrow-${isArabic ? "left" : "right"} ms-1`} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default AttendanceToday;
