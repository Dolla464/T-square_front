import { useEffect, useState } from "react";
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

function StudentAttendance() {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("today");
  const [selectedGroupId, setSelectedGroupId] = useState(null);

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
    loadToday,
    loadQrCode,
    selectSession,
    selectGroup,
  } = useStudentAttendance();

  useEffect(() => {
    const sessionId = searchParams.get("session");
    if (!sessionId || loading || todaySessions.length === 0) return;

    const matched = todaySessions.find(
      (s) => String(s.session_id) === String(sessionId),
    );

    if (matched) {
      selectSession(matched);
      setActiveTab("today");
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
                ) : qrLoading ? (
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
