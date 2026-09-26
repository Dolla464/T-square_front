import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import DetailModal from "../../../../components/shared/DetailModal/DetailModal";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import AdminPagination from "../../components/shared/AdminPagination";
import { useActivityLogs } from "../../hooks/useActivityLogs";
import { getStoredActivityLogToken } from "../../services/activityLogService";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import "./activityHistory.css";

const METHOD_STYLES = {
  GET: { bg: "#f1f3f4", color: "#5f6368" },
  POST: { bg: "#e8f0fe", color: "#1a73e8" },
  PUT: { bg: "#fef7e0", color: "#f9ab00" },
  PATCH: { bg: "#fef7e0", color: "#f9ab00" },
  DELETE: { bg: "#fce8e6", color: "#d93025" },
};

const ROLE_STYLES = {
  admin: { bg: "#fce8e6", color: "#d32f2f" },
  instructor: { bg: "#fef7e0", color: "#f59e0b" },
  receptionist: { bg: "#e6f4ea", color: "#137333" },
  student: { bg: "#e8f0fe", color: "#1a73e8" },
  guest: { bg: "#f1f3f4", color: "#5f6368" },
};

function AdminHistory() {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const { logs, pagination, loading, fetchLogs } = useActivityLogs();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!getStoredActivityLogToken()) {
      toastError(
        t("history.errors.access_denied", "Please verify your password to access history."),
      );
      navigate("/admin", { replace: true });
    }
  }, [navigate, t]);

  const loadLogs = useCallback(async () => {
    if (!getStoredActivityLogToken()) {
      return;
    }

    const params = {
      page: currentPage,
      per_page: 15,
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (roleFilter !== "all") params.role = roleFilter;
    if (methodFilter !== "all") params.method = methodFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    try {
      await fetchLogs(params);
    } catch (err) {
      if ([401, 403].includes(err?.response?.status)) {
        navigate("/admin", { replace: true });
      }
    }
  }, [
    currentPage,
    debouncedSearch,
    roleFilter,
    methodFilter,
    dateFrom,
    dateTo,
    fetchLogs,
    navigate,
  ]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const pageStats = useMemo(() => {
    const successCount = logs.filter(
      (log) => log.response_status >= 200 && log.response_status < 300,
    ).length;
    const errorCount = logs.filter((log) => log.response_status >= 400).length;
    const guestCount = logs.filter((log) => log.role === "guest").length;

    return {
      total: pagination?.total ?? 0,
      successCount,
      errorCount,
      guestCount,
    };
  }, [logs, pagination?.total]);

  const formatDateTime = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString(isArabic ? "ar-EG" : "en-US");
  };

  const getMethodBadge = (method) => {
    const style = METHOD_STYLES[method] || { bg: "#f1f3f4", color: "#374151" };
    return (
      <span
        className="ac-status-badge history-method-badge"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {method}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const style = ROLE_STYLES[role] || { bg: "#f1f3f4", color: "#5f6368" };
    const label = t(`history.roles.${role}`, role);
    return (
      <span
        className="ac-status-badge history-role-badge"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (!status) return "—";
    const isSuccess = status >= 200 && status < 300;
    const isError = status >= 400;
    const className = isSuccess
      ? "bg-success-subtle text-success"
      : isError
        ? "bg-danger-subtle text-danger"
        : "bg-warning-subtle text-warning";

    return <span className={`ac-status-badge ${className}`}>{status}</span>;
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    roleFilter !== "all" ||
    methodFilter !== "all" ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  return (
    <div className="admin-content-page" dir={isArabic ? "rtl" : "ltr"}>
      <div className="ac-header history-page-header d-flex justify-content-between align-items-start align-items-md-center mb-4">
        <div className="history-page-heading">
          <h2 className="ac-title">{t("history.title", "Activity History")}</h2>
          <p className="ac-subtitle text-muted mb-0">
            {t(
              "history.subtitle",
              "Track all platform actions across admins, staff, students, and guests.",
            )}
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4 history-stats-row">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="state p-3 d-flex flex-column justify-content-between history-stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center history-stat-icon"
                style={{ backgroundColor: "#fce8e6", color: "#d32f2f" }}
              >
                <i className="bi bi-clock-history fs-5"></i>
              </div>
              <span className="fw-semibold text-muted history-stat-meta">
                {t("history.stats.all_time", "All time")}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1 history-stat-value">{pageStats.total}</h3>
              <span className="text-muted history-stat-label">
                {t("history.stats.total_logs", "Total Logs")}
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="state p-3 d-flex flex-column justify-content-between history-stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center history-stat-icon"
                style={{ backgroundColor: "#e6f4ea", color: "#137333" }}
              >
                <i className="bi bi-check-circle fs-5"></i>
              </div>
              <span className="fw-semibold text-success history-stat-meta">
                {t("history.stats.this_page", "This page")}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1 history-stat-value">{pageStats.successCount}</h3>
              <span className="text-muted history-stat-label">
                {t("history.stats.successful", "Successful")}
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="state p-3 d-flex flex-column justify-content-between history-stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center history-stat-icon"
                style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}
              >
                <i className="bi bi-exclamation-triangle fs-5"></i>
              </div>
              <span className="fw-semibold text-danger history-stat-meta">
                {t("history.stats.this_page", "This page")}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1 history-stat-value">{pageStats.errorCount}</h3>
              <span className="text-muted history-stat-label">
                {t("history.stats.errors", "Errors")}
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="state p-3 d-flex flex-column justify-content-between history-stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center history-stat-icon"
                style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
              >
                <i className="bi bi-person-dash fs-5"></i>
              </div>
              <span className="fw-semibold text-muted history-stat-meta">
                {t("history.stats.this_page", "This page")}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1 history-stat-value">{pageStats.guestCount}</h3>
              <span className="text-muted history-stat-label">
                {t("history.stats.guest_actions", "Guest Actions")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ac-rounded-table p-3 p-md-4 history-table-card">
        <div className="ac-filters-bar d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-3 mb-4">
          <div className="ac-search-input-wrapper position-relative w-100 w-lg-50">
            <i
              className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${
                searchTerm ? "text-danger fw-bold" : "text-muted"
              }`}
              style={{ zIndex: 3 }}
            ></i>
            <input
              type="text"
              className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${
                searchTerm
                  ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium"
                  : "border-light bg-light text-muted"
              }`}
              placeholder={t("history.filters.search", "Search user, path, IP...")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="d-flex gap-2 flex-wrap flex-lg-nowrap justify-content-lg-end w-100 history-filter-group">
            <select
              className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${
                roleFilter !== "all"
                  ? "border-danger bg-danger-subtle text-danger-emphasis"
                  : "border-light bg-light text-muted"
              }`}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">{t("history.filters.all_roles", "All roles")}</option>
              <option value="admin">{t("history.roles.admin", "Admin")}</option>
              <option value="instructor">{t("history.roles.instructor", "Instructor")}</option>
              <option value="receptionist">{t("history.roles.receptionist", "Receptionist")}</option>
              <option value="student">{t("history.roles.student", "Student")}</option>
              <option value="guest">{t("history.roles.guest", "Guest")}</option>
            </select>

            <select
              className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${
                methodFilter !== "all"
                  ? "border-danger bg-danger-subtle text-danger-emphasis"
                  : "border-light bg-light text-muted"
              }`}
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">{t("history.filters.all_methods", "All methods")}</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>

            <input
              type="date"
              className={`form-control ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${
                dateFrom
                  ? "border-danger bg-danger-subtle text-danger-emphasis"
                  : "border-light bg-light text-muted"
              }`}
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              title={t("history.filters.date_from", "From date")}
            />

            <input
              type="date"
              className={`form-control ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${
                dateTo
                  ? "border-danger bg-danger-subtle text-danger-emphasis"
                  : "border-light bg-light text-muted"
              }`}
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              title={t("history.filters.date_to", "To date")}
            />
          </div>
        </div>

        {loading && logs.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" role="status">
              <span className="visually-hidden">{t("history.loading", "Loading...")}</span>
            </Spinner>
            <p className="mt-2 text-muted fw-semibold">
              {t("history.loading", "Loading activity logs...")}
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-5 bg-white border rounded-4 shadow-sm history-empty-state">
            <i className="bi bi-journal-text text-muted fs-1 mb-3 d-block"></i>
            <h5 className="fw-bold text-dark">
              {t("history.empty_title", "No Activity Found")}
            </h5>
            <p className="text-muted small px-3 mb-0">
              {hasActiveFilters
                ? t(
                    "history.empty_filtered",
                    "No logs match your current filters. Try adjusting your search.",
                  )
                : t("history.empty", "No activity logs found.")}
            </p>
          </div>
        ) : (
          <>
          <div className="history-mobile-list d-lg-none">
            {logs.map((log) => (
              <article key={log.id} className="history-mobile-card">
                <div className="history-mobile-card-top">
                  <span className="history-mobile-datetime">
                    {formatDateTime(log.created_at)}
                  </span>
                  {getStatusBadge(log.response_status)}
                </div>

                <div className="history-mobile-user">
                  <span className="history-user-name fw-medium">
                    {log.user_name || t("history.guest_user", "Guest")}
                  </span>
                  {getRoleBadge(log.role)}
                </div>

                <p className="history-mobile-desc mb-0">
                  {log.description || "—"}
                </p>

                <div className="history-mobile-meta">
                  {getMethodBadge(log.http_method)}
                  <code className="history-path-code history-path-code--mobile">
                    {log.path}
                  </code>
                </div>

                <div className="history-mobile-footer">
                  <span className="history-mobile-ip">
                    {log.ip_address || "—"}
                  </span>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="history-details-btn rounded-3"
                    disabled={!log.request_data}
                    onClick={() => setSelectedLog(log)}
                  >
                    <i className="bi bi-eye"></i>
                    <span className="history-details-btn-text ms-1">
                      {t("history.view_details", "View")}
                    </span>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="table-responsive history-table-wrap d-none d-lg-block">
            <table className="table ac-table mb-0 align-middle history-table" dir="ltr">
              <thead>
                <tr className="text-muted">
                  <th>{t("history.columns.datetime", "Date / Time")}</th>
                  <th>{t("history.columns.user", "User")}</th>
                  <th>{t("history.columns.action", "Action")}</th>
                  <th>{t("history.columns.method", "Method")}</th>
                  <th>{t("history.columns.path", "Path")}</th>
                  <th>{t("history.columns.ip", "IP")}</th>
                  <th>{t("history.columns.status", "Status")}</th>
                  <th className="text-center">{t("history.columns.details", "Details")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="spinner-border text-danger" role="status"></div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="history-row ac-parent-row">
                      <td className="text-nowrap history-datetime">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span className="fw-medium text-dark history-user-name">
                            {log.user_name || t("history.guest_user", "Guest")}
                          </span>
                          {getRoleBadge(log.role)}
                        </div>
                      </td>
                      <td>
                        <span className="history-description ac-truncate-text d-inline-block">
                          {log.description || "—"}
                        </span>
                      </td>
                      <td>{getMethodBadge(log.http_method)}</td>
                      <td>
                        <code className="history-path-code">{log.path}</code>
                      </td>
                      <td className="small text-muted">{log.ip_address || "—"}</td>
                      <td>{getStatusBadge(log.response_status)}</td>
                      <td className="text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="history-details-btn rounded-3 px-3"
                          disabled={!log.request_data}
                          onClick={() => setSelectedLog(log)}
                        >
                          <i className="bi bi-eye me-lg-1"></i>
                          <span className="d-none d-xl-inline">
                            {t("history.view_details", "View")}
                          </span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {pagination && (
        <AdminPagination pagination={pagination} onPageChange={setCurrentPage} />
      )}

      <DetailModal
        show={Boolean(selectedLog)}
        onHide={() => setSelectedLog(null)}
        title={t("history.details_title", "Request Details")}
        size="lg"
        scrollable
        dir={isArabic ? "rtl" : "ltr"}
        bodyClassName="activity-history-details pt-2"
      >
        {selectedLog && (
          <div className="history-details-body">
            <div className="history-details-meta mb-3">
              <div className="d-flex flex-wrap gap-2 mb-3">
                {getMethodBadge(selectedLog.http_method)}
                {getRoleBadge(selectedLog.role)}
                {getStatusBadge(selectedLog.response_status)}
              </div>
              <p className="mb-1">
                <strong>{t("history.columns.user", "User")}:</strong>{" "}
                {selectedLog.user_name || t("history.guest_user", "Guest")}
              </p>
              <p className="mb-1">
                <strong>{t("history.columns.datetime", "Date / Time")}:</strong>{" "}
                {formatDateTime(selectedLog.created_at)}
              </p>
              <p className="mb-0">
                <strong>{t("history.columns.path", "Path")}:</strong>{" "}
                <code className="history-path-code">{selectedLog.path}</code>
              </p>
            </div>
            <pre>{JSON.stringify(selectedLog.request_data, null, 2)}</pre>
          </div>
        )}
      </DetailModal>
    </div>
  );
}

export default AdminHistory;
