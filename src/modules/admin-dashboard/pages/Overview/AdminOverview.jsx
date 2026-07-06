import React from "react";
import { Spinner, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  useAdminDashboardStats,
  useAdminRevenueChart,
  useAdminCourseSales,
  useAdminRecentEnrollments,
  useAdminRecentOrders,
  useAdminTopCourses,
} from "../../hooks/useAdminDashboard";
import { viewModeBtnClass } from "../../components/shared/adminUiStyles";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const AVATAR_COLORS = [
  { bg: "#fee2e2", color: "#ef4444" },
  { bg: "#e0f2fe", color: "#0ea5e9" },
  { bg: "#f3e8ff", color: "#a855f7" },
  { bg: "#e2f9eb", color: "#22c55e" },
];

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatRelativeTime(dateStr, isArabic) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return isArabic ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return isArabic ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return isArabic ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
}

function formatCurrency(amount, isArabic) {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value, isArabic) {
  return new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(value ?? 0);
}

function formatChartLabels(labels, period, isArabic) {
  if (!Array.isArray(labels)) return [];

  return labels.map((label) => {
    if (period === "week") {
      const date = new Date(label);
      return date.toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
        weekday: "short",
      });
    }
    if (period === "month") {
      const [year, month] = String(label).split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);
      return date.toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
        month: "short",
      });
    }
    return label;
  });
}

function StatCardSkeleton() {
  return (
    <div className="state p-3 d-flex align-items-center justify-content-center" style={{ minHeight: "140px" }}>
      <Spinner animation="border" size="sm" variant="danger" />
    </div>
  );
}

function AdminOverview() {
  const { t, i18n } = useTranslation("adminDashboard", { keyPrefix: "overview" });
  const isArabic = i18n.language?.startsWith("ar");
  const navigate = useNavigate();

  const [revenueTimeframe, setRevenueTimeframe] = React.useState("month");
  const [salesTimeframe, setSalesTimeframe] = React.useState("month");

  const { data: stats, loading: statsLoading, error: statsError } = useAdminDashboardStats();
  const { data: revenueChart, loading: revenueLoading } = useAdminRevenueChart(revenueTimeframe);
  const { data: salesChart, loading: salesLoading } = useAdminCourseSales(salesTimeframe);
  const { data: recentEnrollments, loading: enrollmentsLoading } = useAdminRecentEnrollments();
  const { data: recentOrders, loading: ordersLoading } = useAdminRecentOrders();
  const { data: topCourses, loading: topCoursesLoading } = useAdminTopCourses();

  const revenueLabels = formatChartLabels(revenueChart?.labels, revenueTimeframe, isArabic);
  const revenueValues = revenueChart?.data ?? [];
  const revenueMax = Math.max(...revenueValues, 1);

  const revenueData = {
    labels: revenueLabels,
    datasets: [
      {
        label: isArabic ? "الإيرادات" : "Revenue",
        data: revenueValues,
        borderColor: "#be1522",
        backgroundColor: "rgba(190, 21, 34, 0.05)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#be1522",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { padding: 10, cornerRadius: 8 } },
    scales: {
      y: {
        min: 0,
        suggestedMax: revenueMax * 1.2,
        ticks: { color: "#888", font: { size: 10 } },
        grid: { color: "#f1f3f5", tickBorderDash: [3, 3], drawBorder: false },
      },
      x: {
        ticks: { color: "#888", font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  const salesValues = salesChart?.data ?? [];
  const salesMax = Math.max(...salesValues, 1);
  const salesLabels = salesChart?.labels?.length
    ? salesChart.labels
    : [isArabic ? "لا توجد بيانات" : "No data"];

  const salesData = {
    labels: salesLabels,
    datasets: [
      {
        label: isArabic ? "المبيعات" : "Sales",
        data: salesValues.length ? salesValues : [0],
        backgroundColor: "#be1522",
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 30,
      },
    ],
  };

  const salesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { padding: 10, cornerRadius: 8 } },
    scales: {
      y: {
        min: 0,
        suggestedMax: salesMax * 1.2,
        ticks: { color: "#888", font: { size: 10 } },
        grid: { color: "#f1f3f5", tickBorderDash: [3, 3], drawBorder: false },
      },
      x: {
        ticks: { color: "#888", font: { size: 10 }, maxRotation: 45, minRotation: 0 },
        grid: { display: false },
      },
    },
  };

  const statusLabel = (status) => {
    const map = {
      completed: isArabic ? "مكتمل" : "completed",
      pending: isArabic ? "معلق" : "pending",
      cancelled: isArabic ? "ملغي" : "cancelled",
      refunded: isArabic ? "مسترد" : "refunded",
    };
    return map[status] ?? status;
  };

  const statusBadgeClass = (status) => {
    if (status === "completed") return "bg-success-subtle text-success";
    if (status === "pending") return "bg-warning-subtle text-warning";
    if (status === "refunded") return "bg-secondary-subtle text-secondary";
    return "bg-danger-subtle text-danger";
  };

  return (
    <div className="admin-content-page py-1" dir={isArabic ? "rtl" : "ltr"}>
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{t("overview")}</h2>
          <p className="ac-subtitle text-muted mb-0">{t("subtitle")}</p>
        </div>
      </div>

      {statsError && (
        <Alert variant="danger" className="mb-4">
          {statsError}
        </Alert>
      )}

      <div className="row g-3 mb-4">
        {statsLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="col-lg-3 col-6">
              <StatCardSkeleton />
            </div>
          ))
        ) : (
          <>
            <div className="col-lg-3 col-12">
              <div className="state p-3 d-flex flex-column justify-content-between" style={{ minHeight: "140px" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px", backgroundColor: "#e2f9eb", color: "#22c55e" }}
                  >
                    <i className="bi bi-currency-dollar fs-5"></i>
                  </div>
                </div>
                <div>
                  <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827" }}>
                    {formatCurrency(stats?.total_revenue, isArabic)}
                  </h3>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>{t("totalRevenue")}</span>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-12">
              <div className="state p-3 d-flex flex-column justify-content-between" style={{ minHeight: "140px" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px", backgroundColor: "#e0f2fe", color: "#0ea5e9" }}
                  >
                    <i className="bi bi-people fs-5"></i>
                  </div>
                </div>
                <div>
                  <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827" }}>
                    {formatNumber(stats?.total_students, isArabic)}
                  </h3>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>{t("totalStudents")}</span>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="state p-3 d-flex flex-column justify-content-between" style={{ minHeight: "140px" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px", backgroundColor: "#f3e8ff", color: "#a855f7" }}
                  >
                    <i className="bi bi-journal-bookmark fs-5"></i>
                  </div>
                </div>
                <div>
                  <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827" }}>
                    {formatNumber(stats?.total_courses, isArabic)}
                  </h3>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>{t("totalCourses")}</span>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              <div className="state p-3 d-flex flex-column justify-content-between" style={{ minHeight: "140px" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px", backgroundColor: "#fee2e2", color: "#ef4444" }}
                  >
                    <i className="bi bi-graph-up-arrow fs-5"></i>
                  </div>
                </div>
                <div>
                  <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827" }}>
                    {formatNumber(stats?.active_courses, isArabic)}
                  </h3>
                  <span className="text-muted" style={{ fontSize: "0.82rem" }}>{t("activeCourses")}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6 col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-4">
              <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{t("revenueOverTime")}</h4>
              <div className="d-flex gap-2">
                {["week", "month", "year"].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    className={viewModeBtnClass(revenueTimeframe === tf)}
                    onClick={() => setRevenueTimeframe(tf)}
                  >
                    {t(tf)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: "240px", position: "relative" }}>
              {revenueLoading ? (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Spinner animation="border" size="sm" variant="danger" />
                </div>
              ) : (
                <Line data={revenueData} options={revenueOptions} />
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6 col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-4">
              <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{t("courseSales")}</h4>
              <div className="d-flex gap-2">
                {["week", "month", "year"].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    className={viewModeBtnClass(salesTimeframe === tf)}
                    onClick={() => setSalesTimeframe(tf)}
                  >
                    {t(tf)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: "240px", position: "relative" }}>
              {salesLoading ? (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Spinner animation="border" size="sm" variant="danger" />
                </div>
              ) : (
                <Bar data={salesData} options={salesOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6 col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{t("latestEnrollments")}</h4>
              <button
                className="btn btn-link text-decoration-none text-muted fw-semibold p-0"
                style={{ fontSize: "0.85rem" }}
                onClick={() => navigate("/admin/students")}
              >
                {t("viewAll")}
              </button>
            </div>
            {enrollmentsLoading ? (
              <div className="text-center py-4"><Spinner animation="border" size="sm" variant="danger" /></div>
            ) : !recentEnrollments?.length ? (
              <p className="text-muted text-center mb-0">{isArabic ? "لا توجد اشتراكات" : "No enrollments yet"}</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {recentEnrollments.map((item, index) => {
                  const palette = AVATAR_COLORS[index % AVATAR_COLORS.length];
                  return (
                    <div key={item.id} className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 ms-3"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: palette.bg,
                            color: palette.color,
                            flexShrink: 0,
                            fontSize: "0.9rem",
                          }}
                        >
                          {getInitials(item.student_name)}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "0.92rem" }}>{item.student_name}</h6>
                          <span className="text-muted" style={{ fontSize: "0.78rem" }}>{item.course_title}</span>
                        </div>
                      </div>
                      <span className="text-muted small" style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                        {formatRelativeTime(item.created_at, isArabic)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6 col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{t("recentOrders")}</h4>
              <button
                className="btn btn-link text-decoration-none text-muted fw-semibold p-0"
                style={{ fontSize: "0.85rem" }}
                onClick={() => navigate("/admin/orders")}
              >
                {t("viewAll")}
              </button>
            </div>
            {ordersLoading ? (
              <div className="text-center py-4"><Spinner animation="border" size="sm" variant="danger" /></div>
            ) : !recentOrders?.length ? (
              <p className="text-muted text-center mb-0">{isArabic ? "لا توجد طلبات" : "No orders yet"}</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "0.92rem" }}>{order.student_name}</h6>
                        <span className={`badge ${statusBadgeClass(order.status)} rounded-pill px-2 py-0.5`} style={{ fontSize: "0.68rem", fontWeight: "600" }}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <span className="text-muted" style={{ fontSize: "0.78rem" }}>{order.course_title || "-"}</span>
                    </div>
                    <span className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                      {formatCurrency(order.total_amount, isArabic)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{t("topPerformingCourses")}</h4>
              <button
                className="btn btn-link text-decoration-none text-muted fw-semibold p-0"
                style={{ fontSize: "0.85rem" }}
                onClick={() => navigate("/admin/courses")}
              >
                {t("viewAll")}
              </button>
            </div>
            {topCoursesLoading ? (
              <div className="text-center py-4"><Spinner animation="border" size="sm" variant="danger" /></div>
            ) : !topCourses?.length ? (
              <p className="text-muted text-center mb-0">{isArabic ? "لا توجد كورسات" : "No courses yet"}</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                  <thead>
                    <tr className="text-muted" style={{ fontSize: "0.78rem", fontWeight: "600" }}>
                      <th className="border-bottom-0 pb-3 ps-0">{t("course")}</th>
                      <th className="border-bottom-0 pb-3">{t("students")}</th>
                      <th className="border-bottom-0 pb-3">{t("rating")}</th>
                      <th className="border-bottom-0 pb-3 text-end pe-0">{t("revenue")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCourses.map((course, index) => {
                      const isLast = index === topCourses.length - 1;
                      return (
                        <tr key={course.id}>
                          <td className={`fw-bold text-dark ps-0 py-3 ${isLast ? "border-bottom-0" : ""}`} style={{ fontSize: "0.92rem" }}>
                            {course.title}
                          </td>
                          <td className={`text-muted py-3 ${isLast ? "border-bottom-0" : ""}`} style={{ fontSize: "0.88rem" }}>
                            {isArabic
                              ? `${formatNumber(course.students_count, isArabic)} طالب`
                              : `${formatNumber(course.students_count, isArabic)} students`}
                          </td>
                          <td className={`py-3 ${isLast ? "border-bottom-0" : ""}`} style={{ fontSize: "0.88rem" }}>
                            <span style={{ color: "#ffc107" }} className="me-1">★</span>
                            <span className="fw-semibold">{course.rating}</span>
                          </td>
                          <td className={`fw-bold text-dark text-end pe-0 py-3 ${isLast ? "border-bottom-0" : ""}`} style={{ fontSize: "0.92rem" }}>
                            {formatCurrency(course.revenue, isArabic)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
