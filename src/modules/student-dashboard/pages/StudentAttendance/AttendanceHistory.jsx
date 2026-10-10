import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Spinner, Table } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import SessionStatusBadge from "../../../../components/shared/SessionStatusBadge/SessionStatusBadge";
import StatCard from "../../components/StatCard";
import { useAttendanceHistory } from "../../hooks/useAttendanceHistory";
import StatusBadge from "./components/StatusBadge";
import { computeOverallAttendanceStats } from "./utils/attendanceStats";
import {
  ATTENDANCE_CHART_COLORS,
  ATTENDANCE_STATUS_ORDER,
  buildAttendanceChartData,
  buildAttendanceChartOptions,
  countSessionsByStatus,
} from "../../../../utils/attendanceChart";
import "../../styles/dashboardShared.css";
import "./StudentAttendance.css";
import { isArabicLocale } from "../../../../utils/isArabicLocale";

ChartJS.register(ArcElement, Tooltip, Legend);

function AttendanceHistory() {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = isArabicLocale(i18n.language);

  const {
    summary,
    selectedGroupId,
    groupHistory,
    loading,
    historyLoading,
    selectGroup,
  } = useAttendanceHistory();

  const overallStats = useMemo(
    () => computeOverallAttendanceStats(summary),
    [summary],
  );

  const groupSessions = groupHistory?.sessions ?? [];
  const groupStatusCounts = useMemo(
    () => countSessionsByStatus(groupSessions),
    [groupSessions],
  );

  const groupChartLabelKeys = useMemo(
    () => ({
      present: "attendance.chartPresent",
      late: "attendance.chartLate",
      absent: "attendance.chartAbsent",
      not_marked: "attendance.chartNotMarked",
    }),
    [],
  );

  const chartData = useMemo(
    () =>
      buildAttendanceChartData({
        counts: groupStatusCounts,
        getLabel: (status) => t(groupChartLabelKeys[status]),
      }),
    [groupStatusCounts, t, groupChartLabelKeys],
  );

  const chartOptions = useMemo(
    () =>
      buildAttendanceChartOptions({
        isArabic,
        totalSessions: groupHistory?.total_sessions ?? groupSessions.length,
        showLegend: false,
      }),
    [isArabic, groupHistory?.total_sessions, groupSessions.length],
  );

  const chartLegendItems = useMemo(() => {
    const items = ATTENDANCE_STATUS_ORDER.filter(
      (status) => (groupStatusCounts[status] ?? 0) > 0,
    ).map((status) => ({
      status,
      label: t(groupChartLabelKeys[status]),
      color: ATTENDANCE_CHART_COLORS[status],
      count: groupStatusCounts[status],
    }));

    if (items.length === 0) {
      return [
        {
          status: "not_marked",
          label: t(groupChartLabelKeys.not_marked),
          color: ATTENDANCE_CHART_COLORS.not_marked,
          count: 0,
        },
      ];
    }

    return items;
  }, [groupStatusCounts, t, groupChartLabelKeys]);

  return (
    <div className="student-attendance-page" dir={isArabic ? "rtl" : "ltr"}>
      <div className="attendance-page-header">
        <div>
          <h4 className="dash-page-title mb-1">{t("attendance.nav.history")}</h4>
          <p className="text-muted mb-0 small">{t("attendance.historySubtitle")}</p>
        </div>
      </div>

      {loading ? (
        <div className="dash-loading">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              icon="bi-percent"
              iconBg="#fff0f0"
              iconColor="#be1522"
              value={`${overallStats.pct}%`}
              label={t("attendance.stats.attendanceRate")}
            />
            <StatCard
              icon="bi-check2-circle"
              iconBg="#efffef"
              iconColor="#22c55e"
              value={overallStats.present}
              label={t("attendance.stats.presentSessions")}
            />
            <StatCard
              icon="bi-x-circle"
              iconBg="#fff5f5"
              iconColor="#ff4d4f"
              value={overallStats.absent}
              label={t("attendance.stats.absentSessions")}
            />
            <StatCard
              icon="bi-journals"
              iconBg="#eef3ff"
              iconColor="#4a6cf7"
              value={overallStats.total}
              label={t("attendance.stats.totalSessions")}
            />
          </div>

          <Card>
            <Card.Body>
              <h6 className="section-title mb-3">{t("attendance.myGroups")}</h6>

              {summary.length === 0 ? (
                <div className="py-4 text-center text-muted">
                  <p className="mb-0 small">{t("attendance.noGroups")}</p>
                </div>
              ) : (
                <div className="attendance-group-chips">
                  {summary.map((group) => (
                    <button
                      key={group.group_id}
                      type="button"
                      className={`attendance-group-chip ${
                        selectedGroupId === group.group_id ? "active" : ""
                      }`}
                      onClick={() => selectGroup(group.group_id)}
                    >
                      <span className="attendance-group-chip-title">{group.course_title}</span>
                      <span className="attendance-group-chip-meta">
                        {group.group_name} · {group.attendance_percentage}%
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {historyLoading ? (
                <div className="dash-loading py-4">
                  <Spinner animation="border" variant="danger" />
                </div>
              ) : !groupHistory ? (
                <div className="py-5 text-center text-muted">
                  <p className="mb-0">{t("attendance.selectGroup")}</p>
                </div>
              ) : (
                <>
                  <Row className="attendance-history-summary align-items-center mb-4 g-3 mt-2">
                    <Col xs={12} md={5} className="text-center">
                      <div className="attendance-history-chart">
                        <div className="attendance-history-chart-ring">
                          <Doughnut data={chartData} options={chartOptions} />
                          <div className="attendance-history-chart-center">
                            <span className="attendance-history-chart-pct">
                              {groupHistory.attendance_percentage}%
                            </span>
                            <div className="text-muted small">
                              {t("attendance.attendanceRate")}
                            </div>
                          </div>
                        </div>
                        <div className="attendance-history-chart-legend">
                          {chartLegendItems.map((item) => (
                            <span key={item.status} className="attendance-history-legend-item">
                              <span
                                className="attendance-history-legend-dot"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.label}
                              {item.count > 0 ? ` (${item.count})` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} md={7} className="attendance-history-summary-text">
                      <h5 className="fw-bold mb-1">{groupHistory.course_title}</h5>
                      <p className="text-muted mb-3 small">{groupHistory.group_name}</p>
                      <p className="text-muted small mb-0">
                        {groupHistory.attended_sessions} / {groupHistory.total_sessions}{" "}
                        {t("attendance.sessionsAttended")}
                      </p>
                    </Col>
                  </Row>

                  {(groupHistory.sessions ?? []).length === 0 ? (
                    <div className="attendance-history-empty py-4 text-center text-muted">
                      <p className="mb-0 small">{t("attendance.noSessionsHistory")}</p>
                    </div>
                  ) : (
                    <div className="table-responsive attendance-history-table-wrap">
                      <Table
                        hover
                        className="align-middle mb-0 text-center attendance-history-table"
                        dir={isArabic ? "rtl" : "ltr"}
                      >
                        <thead>
                          <tr>
                            <th>{t("attendance.date")}</th>
                            <th>{t("attendance.time")}</th>
                            <th>{t("attendance.sessionStatusColumn")}</th>
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
                                <SessionStatusBadge
                                  status={session.session_status}
                                  isArabic={isArabic}
                                  className="attendance-history-session-badge"
                                />
                              </td>
                              <td>
                                <StatusBadge status={session.status} compact />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}

export default AttendanceHistory;
